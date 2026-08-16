import { del, list, put } from "@vercel/blob";

/**
 * Portrait storage on Vercel Blob.
 *
 * Not Supabase Storage: that bucket is unused, the free tier is small, it has
 * no backups, it auto-pauses, and it is now the single point of failure for
 * two apps. Postgres holds URLs only — never bytes.
 *
 * THE PHOTO POLICY (docs/roadmap/phase-3-portal.md):
 * the source selfie is deleted the moment the portrait exists. The portrait
 * then serves as the canonical reference for every later generation. This is
 * both the strongest available privacy posture and a marketing line — we never
 * keep your photo — so it is a product promise, not an implementation detail.
 */

/**
 * Every object a user owns lives under this prefix, which is what makes
 * account deletion possible: FK cascades never reach object storage, so
 * deletion has to enumerate and remove blobs explicitly.
 */
function userPrefix(userId: string): string {
  return `portal/${userId}/`;
}

export function isBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Stores a generated portrait and returns its public URL.
 *
 * `addRandomSuffix` is on so a regenerated portrait never silently overwrites
 * one still referenced by an existing future_selves row.
 */
export async function putPortrait(
  userId: string,
  futureSelfId: string,
  body: Blob | ArrayBuffer | Buffer,
  contentType = "image/webp",
): Promise<string | null> {
  if (!isBlobEnabled()) return null;
  try {
    const { url } = await put(
      `${userPrefix(userId)}portrait-${futureSelfId}`,
      body,
      { access: "public", contentType, addRandomSuffix: true },
    );
    return url;
  } catch (error) {
    console.error("portrait upload failed", error);
    return null;
  }
}

/**
 * Deletes every blob belonging to a user.
 *
 * Called from the account-deletion route. **This cannot be skipped**: the
 * Postgres cascade wipes rows but leaves portraits sitting in object storage,
 * and a portrait outliving its account is a privacy failure, not untidiness.
 *
 * Returns false when anything went wrong so the caller can refuse to report a
 * clean deletion it did not actually achieve.
 */
export async function deleteUserBlobs(userId: string): Promise<boolean> {
  if (!isBlobEnabled()) return true; // Nothing was ever stored.
  try {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: userPrefix(userId), cursor, limit: 1000 });
      if (page.blobs.length > 0) {
        await del(page.blobs.map((b) => b.url));
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return true;
  } catch (error) {
    console.error("blob deletion failed", error);
    return false;
  }
}
