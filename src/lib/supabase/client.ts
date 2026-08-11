import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (client-side auth only — decision log in
 * docs/roadmap/phase-2-accounts.md). The publishable key is browser-safe by
 * design; RLS guards all user data. When the env vars are absent (e.g. a
 * fork without Supabase) every auth surface hides itself — the app core
 * never depends on this client.
 *
 * SCHEMAS (2026-08-11 consolidation): this Supabase project is now shared with
 * First 100, so nothing of ours lives in `public` any more.
 *
 *   getSupabase()  → `saythiswith`, this app's own tables (the default)
 *   platformDb()   → `platform`, identity + entitlements shared across apps
 *
 * The client is pinned to `saythiswith` at construction and `platformDb()`
 * overrides it per query. That is deliberately NOT a second createClient():
 * two clients against one URL means two GoTrue instances sharing one storage
 * key, which race on token refresh. One client, one session, one refresher.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const authEnabled = Boolean(url && key);

// Derived rather than written out: the bare `SupabaseClient` type hard-codes
// the "public" schema, so annotating with it fails now that we're pinned to
// `saythiswith`.
function makeClient() {
  return url && key ? createClient(url, key, { db: { schema: "saythiswith" } }) : null;
}
type AppClient = NonNullable<ReturnType<typeof makeClient>>;

let client: AppClient | null | undefined;

/** Auth, plus this app's data: sessions, streaks, stars, journeys, favorites. */
export function getSupabase(): AppClient | null {
  if (client === undefined) client = makeClient();
  return client;
}

/** Tables shared with every other app on this project: profiles, entitlements. */
export function platformDb() {
  return getSupabase()?.schema("platform") ?? null;
}
