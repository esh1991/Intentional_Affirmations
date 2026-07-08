"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

type Step = "start" | "code";

/** Google icon (lucide has no brand icons). */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3.3.6 4.6 1.8L20 3A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-5 6.7-5Z"
      />
    </svg>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    const supabase = getSupabase();
    if (!supabase) return;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/practice` },
    });
    if (err) {
      setError(
        err.message.toLowerCase().includes("provider")
          ? "Google sign-in isn't set up yet — use an email code below."
          : err.message,
      );
    }
  }

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const supabase = getSupabase();
    if (!supabase) return;
    const { error: err } = await supabase.auth.signInWithOtp({ email });
    setBusy(false);
    if (err) {
      setError(err.message);
    } else {
      setStep("code");
    }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const supabase = getSupabase();
    if (!supabase) return;
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (err) {
      setError("That code didn't match — check the email and try again.");
    } else {
      trackEvent("sign_in", { method: "email_otp" });
      router.push("/practice");
    }
  }

  return (
    <div className="w-full max-w-sm">
      {step === "start" ? (
        <>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <GoogleMark className="size-5" />
            Continue with Google
          </button>
          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={sendCode} className="flex flex-col gap-3">
            <label htmlFor="signin-email" className="sr-only">
              Email address
            </label>
            <input
              id="signin-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 rounded-full border border-border bg-card/70 px-5 outline-none transition-colors focus:border-mode/60"
            />
            <button
              type="submit"
              disabled={busy}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-mode font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              <Mail className="size-4" aria-hidden />
              {busy ? "Sending…" : "Email me a code"}
            </button>
          </form>
        </>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>.
          </p>
          <label htmlFor="signin-code" className="sr-only">
            6-digit code
          </label>
          <input
            id="signin-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="123456"
            className="h-12 rounded-full border border-border bg-card/70 px-5 text-center font-display text-xl tracking-[0.4em] outline-none transition-colors focus:border-mode/60"
          />
          <button
            type="submit"
            disabled={busy}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-mode font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {busy ? "Checking…" : "Sign in"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("start");
              setCode("");
              setError(null);
            }}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}
      {error && (
        <p className="mt-4 text-center text-sm text-red-500" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
