import { del, get, list, put } from "@vercel/blob";

/**
 * Portrait storage on Vercel Blob.
 *
 * Not Supabase Storage: that bucket is unused, the free tier is small, it has
 * no backups, it auto-pauses, and it is now the single point of failure for
 * two apps. Postgres holds URLs only — never bytes.
 *
 * THE PHOTO POLICY (docs/roadmap/phase-3-portal.md):
 * the source selfie is never stored at all — see src/lib/portal/portrait.ts.
 * What lives here is the generated portrait, and it is stored **private**:
 * these are photoreal images of the user's face, and "anyone with the URL can
 * see it" is not an acceptable posture for that. Reads go through a
 * short-lived signed URL minted for the owner.
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
  contentType = "image/jpeg",
): Promise<string | null> {
  if (!isBlobEnabled()) return null;
  try {
    const { pathname } = await put(
      `${userPrefix(userId)}portrait-${futureSelfId}`,
      body,
      { access: "private", contentType, addRandomSuffix: true },
    );
    // Store the pathname, not a URL: a private blob has no durable public URL,
    // and a signed one would expire in the database.
    return pathname;
  } catch (error) {
    console.error("portrait upload failed", error);
    return null;
  }
}

/**
 * Reads a private portrait back.
 *
 * Deliberately not a presigned URL: `presignUrl` needs a two-step token
 * delegation, and a signed URL is a bearer credential that outlives the
 * request. Streaming through our own authenticated route is simpler and
 * strictly tighter — the caller has already proven ownership, and nothing
 * fetchable ever leaves the server.
 *
 * The caller MUST establish that this user owns this pathname first; reading
 * is not authorisation.
 */
export async function readPortrait(
  pathname: string,
): Promise<{ body: ReadableStream; contentType: string } | null> {
  if (!isBlobEnabled()) return null;
  try {
    const result = await get(pathname, { access: "private" });
    if (!result?.stream) return null;
    return {
      body: result.stream,
      contentType: result.headers.get("content-type") ?? "image/jpeg",
    };
  } catch (error) {
    console.error("portrait read failed", error);
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
