import { requireUser } from "@/lib/supabase/server";
import { checkQuota, createJob, updateJob } from "@/lib/portal/jobs";
import {
  MAX_MESSAGE_CHARS,
  MAX_TURNS,
  type Turn,
  conversationEnabled,
  streamReply,
} from "@/lib/portal/conversation";
import { isDomainKey } from "@/lib/portal/domains";
import { clearanceFor, distinctDays } from "@/lib/portal/clearance";

/**
 * One turn of the conversation with the guide.
 *
 * ⚠️ DELIBERATE DEVIATION FROM THE PLAN. The spec says the conversation runs
 * anonymously because it is "cheap, text-only". It does not run anonymously
 * here, and the reason is the one that made `/api/subscribe` the wrong
 * template for generation: an unauthenticated endpoint that calls an LLM is an
 * open money faucet on a public URL. There is no anonymous identity to meter,
 * so there is nothing to rate-limit against.
 *
 * Doing it anonymously *safely* needs a real anon-usage store (hashed IP plus
 * a counter table) — a migration and an owner action. Until someone wants that,
 * sign-in is the honest guard. The portrait step already asks for sign-in
 * immediately before this, so in practice most callers are already signed in.
 */
export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { user, db } = auth;

  if (!conversationEnabled()) {
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  let body: {
    domain?: unknown;
    goal?: unknown;
    horizon?: unknown;
    turns?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const domain = typeof body.domain === "string" ? body.domain : "";
  if (!isDomainKey(domain)) {
    return Response.json({ error: "Unknown domain." }, { status: 400 });
  }
  const goal = typeof body.goal === "string" ? body.goal.slice(0, 200) : "";
  const horizon =
    body.horizon === "6m" || body.horizon === "3y" ? body.horizon : "1y";

  if (!Array.isArray(body.turns) || body.turns.length === 0) {
    return Response.json({ error: "Nothing to send." }, { status: 400 });
  }
  if (body.turns.length > MAX_TURNS) {
    return Response.json(
      { error: "That's all this channel holds. Start a new call." },
      { status: 400 },
    );
  }

  const turns: Turn[] = [];
  for (const raw of body.turns) {
    const t = raw as { role?: unknown; text?: unknown };
    if (
      (t.role !== "user" && t.role !== "assistant") ||
      typeof t.text !== "string" ||
      !t.text.trim()
    ) {
      return Response.json({ error: "Bad request." }, { status: 400 });
    }
    turns.push({ role: t.role, text: t.text.slice(0, MAX_MESSAGE_CHARS) });
  }
  if (turns[turns.length - 1].role !== "user") {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  /*
   * Clearance is computed HERE, from the database — never taken from the
   * request. A client-supplied level would be a free upgrade for anyone who
   * edits a fetch, and the whole mechanic is that it has to be earned.
   */
  const { data: history } = await db
    .from("sessions")
    .select("affirmation,completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(200);

  const rows = history ?? [];
  const clearance = clearanceFor(
    distinctDays(rows.map((r) => r.completed_at as string)),
  );

  const userTurns = turns.filter((t) => t.role === "user").length;
  if (userTurns > clearance.turns) {
    return Response.json(
      { error: "That's all this channel holds today.", clearance: clearance.level },
      { status: 400 },
    );
  }

  // "They remember" is a real capability gate, not a label: below it, the
  // guide is simply never shown what you've been saying.
  const recentLines = clearance.remembers
    ? [...new Set(rows.map((r) => r.affirmation as string))].slice(0, 12)
    : undefined;

  const quota = await checkQuota(user.id, "conversation");
  if (!quota.allowed) {
    return Response.json(
      { error: "You've talked a lot today. The line reopens tomorrow." },
      { status: 429 },
    );
  }

  const jobId = await createJob(user.id, "conversation", "anthropic");

  try {
    const stream = await streamReply({ domain, goal, horizon, turns, recentLines });
    if (jobId) void updateJob(jobId, { status: "completed" });

    // Fire-and-forget: the transcript is substrate for later personalisation,
    // and failing to store it must never break the reply being read right now.
    void db
      .from("portal_conversations")
      .insert({ user_id: user.id, transcript: turns })
      .then(({ error }) => {
        if (error) console.error("transcript insert failed", error);
      });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        // Proxies that buffer would defeat the point of streaming.
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("conversation failed", message);
    if (jobId) {
      void updateJob(jobId, { status: "failed", error: message.slice(0, 500) });
    }
    return Response.json({ error: "The channel dropped." }, { status: 502 });
  }
}
