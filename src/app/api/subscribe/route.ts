import { z } from "zod";

/**
 * Email capture → Supabase `subscribers` table (see docs/supabase.md for the
 * table SQL and env setup). Runs server-side so the secret key never ships to
 * the client. Duplicate emails upsert quietly — resubmitting is a success.
 */

const bodySchema = z.object({
  email: z.email().max(254),
  source: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = bodySchema.safeParse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!parsed.success) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("subscribe: SUPABASE_URL / SUPABASE_SECRET_KEY not set");
    return Response.json(
      { error: "Signups aren't available right now." },
      { status: 503 },
    );
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/subscribers?on_conflict=email`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      email: parsed.data.email.toLowerCase(),
      source: parsed.data.source ?? null,
    }),
  });

  if (!res.ok) {
    console.error("subscribe: Supabase insert failed", res.status, await res.text());
    return Response.json(
      { error: "Something went wrong — try again." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
