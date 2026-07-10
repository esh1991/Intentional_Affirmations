"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { authEnabled, getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";

/**
 * Header auth state: "Sign in" link when signed out, an initial-letter avatar
 * with a small menu when signed in. Renders nothing while loading or when
 * Supabase env vars are absent.
 */
export function AuthButton() {
  const { session, loading } = useSession();
  const [open, setOpen] = useState(false);

  if (!authEnabled || loading) return null;

  if (!session) {
    return (
      <Link
        href="/signin"
        className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
      >
        Sign in
      </Link>
    );
  }

  const email = session.user.email ?? "";
  const name =
    (session.user.user_metadata?.full_name as string | undefined) ?? email;
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-full bg-mode font-display font-bold text-mode-foreground shadow-sm transition-transform hover:scale-105"
        data-mode="powerUp"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-border bg-popover p-2 shadow-xl">
          <p className="truncate px-3 py-2 text-sm text-muted-foreground">{email}</p>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-card"
          >
            <UserRound className="size-4" aria-hidden />
            Account
          </Link>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await getSupabase()?.auth.signOut();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-card"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
