"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import { trackEvent } from "@/lib/analytics";

export function AccountPanel() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [nameStatus, setNameStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.display_name) setDisplayName(data.display_name);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <div className="min-h-48" aria-hidden />;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-muted-foreground">You&apos;re not signed in.</p>
        <Link
          href="/signin"
          className="mt-6 rounded-full bg-mode px-7 py-3 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          Sign in
        </Link>
      </div>
    );
  }

  async function saveName(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase || !userId || nameStatus === "saving") return;
    setNameStatus("saving");
    setError(null);
    const { error: err } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: displayName.trim() || null,
    });
    if (err) {
      setError("Couldn't save — try again.");
      setNameStatus("idle");
    } else {
      setNameStatus("saved");
    }
  }

  async function deleteAccount() {
    const supabase = getSupabase();
    if (!supabase || deleteBusy) return;
    setDeleteBusy(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("no session");
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`delete failed: ${res.status}`);
      trackEvent("account_deleted");
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setError("Couldn't delete the account — try again in a moment.");
      setDeleteBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Signed in as
        </p>
        <p className="mt-1 truncate font-medium">{session.user.email}</p>

        <form onSubmit={saveName} className="mt-6 flex flex-col gap-2">
          <label htmlFor="display-name" className="text-sm font-medium">
            Display name
          </label>
          <div className="flex gap-2">
            <input
              id="display-name"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                setNameStatus("idle");
              }}
              placeholder="How should we cheer you on?"
              className="h-11 flex-1 rounded-full border border-border bg-card/70 px-4 text-sm outline-none transition-colors focus:border-mode/60"
            />
            <button
              type="submit"
              disabled={nameStatus !== "idle"}
              className="h-11 rounded-full bg-mode px-5 text-sm font-semibold text-mode-foreground shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {nameStatus === "saving" ? "Saving…" : nameStatus === "saved" ? "Saved ✓" : "Save"}
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={async () => {
            await getSupabase()?.auth.signOut();
            router.push("/");
          }}
          className="mt-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-red-500/30 bg-card p-7 shadow-sm">
        <p className="font-semibold">Delete account</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently removes your account and all synced data — sessions,
          streaks, journeys, and favorites. Practice data saved on this device
          stays on this device.
        </p>
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mt-4 flex items-center gap-2 rounded-full border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="size-4" aria-hidden />
            Delete my account
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={deleteAccount}
              disabled={deleteBusy}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {deleteBusy ? "Deleting…" : "Yes, delete everything"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Keep my account
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-red-500" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
