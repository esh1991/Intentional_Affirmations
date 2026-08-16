import { requireUser } from "@/lib/supabase/server";
import { readPortrait } from "@/lib/portal/blob";

/**
 * Serves a stored portrait to the person it belongs to.
 *
 * Portraits are private blobs (photoreal images of someone's face), so there
 * is no public URL to link. This route is the read path: it authenticates the
 * caller, confirms the row is theirs, and streams the bytes back from its own
 * origin — so `next/image` needs no remote host allowance, and nothing
 * fetchable ever escapes the server.
 *
 * The `.eq("user_id", user.id)` is load-bearing, not belt-and-braces: this
 * client uses the secret key and bypasses RLS entirely, so that filter is the
 * only thing stopping one user reading another's portrait by id.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { user, db } = auth;

  const { id } = await params;

  const { data, error } = await db
    .from("future_selves")
    .select("portrait_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data?.portrait_url) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const portrait = await readPortrait(data.portrait_url);
  if (!portrait) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  return new Response(portrait.body, {
    headers: {
      "Content-Type": portrait.contentType,
      // Private to this user, so a shared CDN must never hold it.
      "Cache-Control": "private, max-age=300",
    },
  });
}
