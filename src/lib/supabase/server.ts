import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase access. The browser client in ./client.ts is pinned to
 * the `saythiswith` schema at construction; **server clients do not inherit
 * that**, and a fresh createClient() silently talks to `public`, which is now
 * First 100's territory. Every server client is therefore built here, pinned.
 *
 * This client uses the secret key and **bypasses RLS entirely**. Never hand it
 * a user-supplied id: resolve the caller with requireUser() and filter every
 * query by the id it returns.
 *
 * Auth on server routes (docs/roadmap/phase-3-portal.md): there is no
 * server-readable session — supabase-js keeps the JWT in localStorage, there
 * is no middleware and no @supabase/ssr. The caller sends
 * `Authorization: Bearer <access_token>` and we verify it here.
 */

function credentials(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  return url && key ? { url, key } : null;
}

/** True when the server is configured to talk to Supabase at all. */
export function serverDbEnabled(): boolean {
  return credentials() !== null;
}

function makeAdmin() {
  const creds = credentials();
  return creds
    ? createClient(creds.url, creds.key, {
        auth: { persistSession: false, autoRefreshToken: false },
        db: { schema: "saythiswith" },
      })
    : null;
}

// Derived rather than written out, for the same reason as the browser client:
// the bare SupabaseClient type hard-codes the "public" schema.
type AdminClient = NonNullable<ReturnType<typeof makeAdmin>>;

let admin: AdminClient | null | undefined;

/**
 * Service-role client for this app's tables. Pinned to `saythiswith` — so
 * `.from("generation_jobs")` means `saythiswith.generation_jobs`.
 */
export function adminDb(): AdminClient | null {
  if (admin === undefined) admin = makeAdmin();
  return admin;
}

/** Tables shared with every other app on this project: profiles, entitlements. */
export function platformAdminDb() {
  return adminDb()?.schema("platform") ?? null;
}

export interface AuthedUser {
  id: string;
  email: string | null;
}

type AuthResult =
  | { ok: true; user: AuthedUser; db: AdminClient }
  | { ok: false; response: Response };

/**
 * Verifies the caller's bearer token and returns them alongside a pinned
 * admin client. Routes should do:
 *
 *   const auth = await requireUser(request);
 *   if (!auth.ok) return auth.response;
 *
 * Failure responses are deliberately vague: an unauthenticated caller learns
 * nothing about whether a token was malformed, expired, or simply unknown.
 */
export async function requireUser(request: Request): Promise<AuthResult> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) {
    return {
      ok: false,
      response: Response.json({ error: "Not signed in." }, { status: 401 }),
    };
  }

  const db = adminDb();
  if (!db) {
    return {
      ok: false,
      response: Response.json({ error: "Not configured." }, { status: 503 }),
    };
  }

  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) {
    return {
      ok: false,
      response: Response.json({ error: "Not signed in." }, { status: 401 }),
    };
  }

  return {
    ok: true,
    user: { id: data.user.id, email: data.user.email ?? null },
    db,
  };
}
