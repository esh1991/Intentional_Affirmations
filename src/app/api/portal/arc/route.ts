import { requireUser } from "@/lib/supabase/server";
import { checkQuota, createJob, updateJob } from "@/lib/portal/jobs";
import { arcGenerationEnabled, generateArc } from "@/lib/portal/arc";
import { isDomainKey } from "@/lib/portal/domains";

/**
 * Generates a personal 21-day arc and persists it.
 *
 * Generation measured ~27s at `effort: "high"`, so this runs synchronously
 * behind a raised `maxDuration` rather than through the poll loop the portrait
 * needs. It still writes a `generation_jobs` row: that row is what the daily
 * quota counts, and it means moving to polling later is a client change only.
 *
 * ⚠️ `maxDuration` above 60s requires a Vercel plan that allows it. On Hobby
 * the ceiling is 60s, which a slow generation could brush — if arcs start
 * timing out in production, that is the first thing to check.
 */
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { user, db } = auth;

  if (!arcGenerationEnabled()) {
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  let body: { domain?: unknown; goal?: unknown; horizon?: unknown };
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

  // Checked before any provider call, so a rejection costs nothing.
  const quota = await checkQuota(user.id, "arc");
  if (!quota.allowed) {
    return Response.json(
      {
        error: `You've generated ${quota.used} arcs today. Come back tomorrow.`,
        used: quota.used,
        cap: quota.cap,
      },
      { status: 429 },
    );
  }

  const jobId = await createJob(user.id, "arc", "anthropic");
  if (!jobId) {
    return Response.json({ error: "Couldn't start." }, { status: 503 });
  }

  try {
    await updateJob(jobId, { status: "running" });
    const arc = await generateArc({ domain, goal, horizon });

    const { data: arcRow, error: arcError } = await db
      .from("arcs")
      .insert({
        user_id: user.id,
        duration: 21,
        started_at: new Date().toDateString(),
        completed_days: [],
        status: "active",
      })
      .select("id")
      .single();
    if (arcError || !arcRow) throw new Error(arcError?.message ?? "arc insert failed");

    const { error: daysError } = await db.from("arc_days").insert(
      arc.days.map((d, i) => ({
        arc_id: arcRow.id,
        day_index: i + 1,
        affirmation: d.affirmation,
        success_message: d.successMessage,
      })),
    );
    if (daysError) throw new Error(daysError.message);

    // Opus 5 list pricing: $5/M in, $25/M out. Cached reads bill at ~0.1x, so
    // this over-reports slightly once the exemplar prefix is warm — deliberate,
    // since an over-estimate is the safe direction for a spend guard.
    const costCents = Math.ceil(
      (arc.inputTokens * 5 + arc.outputTokens * 25) / 10_000,
    );
    await updateJob(jobId, {
      status: "completed",
      result_url: arcRow.id,
      cost_cents: costCents,
    });

    return Response.json({ arcId: arcRow.id, days: arc.days });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("arc generation failed", message);
    await updateJob(jobId, { status: "failed", error: message.slice(0, 500) });
    return Response.json(
      { error: "Couldn't reach them just now — try again." },
      { status: 502 },
    );
  }
}
