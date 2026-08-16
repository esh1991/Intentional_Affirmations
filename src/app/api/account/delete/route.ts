import { deleteUserBlobs } from "@/lib/portal/blob";
import { requireUser } from "@/lib/supabase/server";

/**
 * Deletes the calling user's account. The caller proves identity with their
 * access token; the admin client verifies it and deletes the auth user — FK
 * cascades wipe profiles, sessions, streaks, stars, journeys, favorites, and
 * (from 0005) future selves, arcs, conversations and generation jobs.
 *
 * Blobs are deleted FIRST and explicitly. An FK cascade never reaches object
 * storage, so a portrait would otherwise outlive the account that owned it —
 * a privacy failure, and one the "we never keep your photo" promise makes into
 * a broken promise. Ordering matters: if the blob purge fails we stop, because
 * deleting the auth user first would lose the only handle on those objects.
 *
 * docs/shared-backend.md requires re-testing deletion after any change here.
 */
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { user, db } = auth;

  const blobsGone = await deleteUserBlobs(user.id);
  if (!blobsGone) {
    // Refuse to report a clean deletion we did not achieve.
    return Response.json(
      { error: "Couldn't delete your stored images — nothing was removed. Try again." },
      { status: 500 },
    );
  }

  const { error: deleteError } = await db.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("account delete failed", deleteError);
    return Response.json(
      { error: "Couldn't delete the account — try again." },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}
