import { requireUser } from "@/lib/supabase/server";

/**
 * The caller's most recent active arc, with its 21 days.
 *
 * `/pact` asks for this on load: if there's a generated arc it serves that,
 * and if there isn't it falls back to the owner-approved library arc. That
 * fallback is what keeps the daily call working for someone who never signed
 * in — the no-login-wall promise applies to practice, not to generation.
 *
 * The `.eq("user_id")` filter is load-bearing: this client bypasses RLS.
 */
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { user, db } = auth;

  const { data: arc, error } = await db
    .from("arcs")
    .select("id,duration,started_at,completed_days")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("arc lookup failed", error);
    return Response.json({ error: "Couldn't load." }, { status: 500 });
  }
  if (!arc) return Response.json({ arc: null });

  const { data: days, error: daysError } = await db
    .from("arc_days")
    .select("id,day_index,affirmation,success_message")
    .eq("arc_id", arc.id)
    .order("day_index", { ascending: true });

  if (daysError || !days?.length) {
    return Response.json({ arc: null });
  }

  return Response.json({
    arc: {
      id: arc.id,
      days: days.map((d) => ({
        id: d.id as string,
        affirmation: d.affirmation,
        successMessage: d.success_message ?? "",
      })),
    },
  });
}
