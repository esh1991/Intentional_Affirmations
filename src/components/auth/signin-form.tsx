"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { GOOGLE_CLIENT_ID, loadGsi, makeNonce, type GsiCredentialResponse } from "@/lib/auth/google";
import { trackEvent } from "@/lib/analytics";

/**
 * Google sign-in via the GSI ID-token flow.
 *
 * The email-code path that used to sit below this was removed in the 2026-08-11
 * consolidation. Two reasons, and the second is the real one: Supabase's
 * built-in mailer is rate-limited to a handful of messages an hour and is not
 * meant for production, so it was a fallback that wouldn't have held; and one
 * Supabase project now serves two apps, so its single email template can't be
 * branded for both. Sign-in is optional here — practice works fully signed-out
 * — so Google-only costs cloud sync, not the app.
 */
export function SignInForm() {
  const router = useRouter();
  const slot = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  // A build-time constant, so this is decided during render — putting it in the
  // effect would mean a setState-in-effect, which the React Compiler rejects.
  const clientId = GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    (async () => {
      try {
        const [{ raw, hashed }] = await Promise.all([makeNonce(), loadGsi()]);
        if (cancelled || !slot.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          nonce: hashed, // Google hashes it; Supabase is handed `raw` below
          callback: async (response: GsiCredentialResponse) => {
            const supabase = getSupabase();
            if (!supabase) return;
            setBusy(true);
            setError(null);
            const { error: err } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce: raw,
            });
            if (err) {
              setBusy(false);
              setError("That didn't complete — try again.");
              return;
            }
            trackEvent("sign_in", { method: "google" });
            router.push("/portal");
          },
        });

        window.google.accounts.id.renderButton(slot.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
        });
      } catch {
        if (!cancelled) setBlocked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, router]);

  if (!clientId) {
    return (
      <p className="w-full max-w-sm text-center text-sm text-muted-foreground">
        Sign-in isn&apos;t set up yet — your practice is saved on this device.
      </p>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex min-h-12 justify-center" aria-busy={busy}>
        {busy ? (
          <p className="self-center text-sm text-muted-foreground">Signing you in…</p>
        ) : (
          <div ref={slot} />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Signing in only syncs your streak, stars and favorites across devices.
        You can practice without an account.
      </p>

      {blocked && (
        <p className="mt-4 text-center text-sm text-red-500" aria-live="polite">
          Google&apos;s sign-in script didn&apos;t load — an ad blocker or privacy
          extension is the usual cause. Your practice still works without it.
        </p>
      )}
      {error && (
        <p className="mt-4 text-center text-sm text-red-500" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
