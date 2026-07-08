import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (client-side auth only — decision log in
 * docs/roadmap/phase-2-accounts.md). The publishable key is browser-safe by
 * design; RLS guards all user data. When the env vars are absent (e.g. a
 * fork without Supabase) every auth surface hides itself — the app core
 * never depends on this client.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const authEnabled = Boolean(url && key);

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client === undefined) {
    client = url && key ? createClient(url, key) : null;
  }
  return client;
}
