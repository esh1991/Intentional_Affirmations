"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { authEnabled, getSupabase } from "@/lib/supabase/client";

/**
 * Current auth session, hydration-safe: null on the server and while loading.
 * `loading` distinguishes "signed out" from "not yet known".
 */
export function useSession(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  // Starts false when auth is disabled entirely, so no effect-time setState.
  const [loading, setLoading] = useState(authEnabled);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!cancelled) setSession(next);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
