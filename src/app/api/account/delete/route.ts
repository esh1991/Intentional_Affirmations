import { createClient } from "@supabase/supabase-js";

/**
 * Deletes the calling user's account. The caller proves identity with their
 * access token; the admin client (secret key, server-only) verifies it and
 * deletes the auth user — FK cascades wipe profiles, sessions, streaks,
 * stars, journeys, and favorites.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    console.error("account delete failed", deleteError);
    return Response.json(
      { error: "Couldn't delete the account — try again." },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}
