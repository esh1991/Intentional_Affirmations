"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/hooks/use-session";
import { syncNow } from "@/lib/sync";
import { identifyUser, resetIdentity } from "@/lib/analytics";

/**
 * Watches the auth session from the root layout: on sign-in (or page load
 * with an existing session) runs the two-way merge once and identifies the
 * user in analytics; on sign-out resets analytics identity.
 */
export function SyncManager() {
  const { session } = useSession();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    const user = session?.user;
    if (user && syncedFor.current !== user.id) {
      syncedFor.current = user.id;
      void syncNow(user);
      identifyUser(user.id, user.email);
    }
    if (!user && syncedFor.current) {
      syncedFor.current = null;
      resetIdentity();
    }
  }, [session]);

  return null;
}
