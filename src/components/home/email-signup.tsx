"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "sending" | "done" | "error";

/**
 * The one email capture point on the site (win screen stays clean for the
 * celebration). Posts to /api/subscribe, which writes to Supabase.
 */
export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "home" }),
      });
      if (!res.ok) throw new Error(`subscribe failed: ${res.status}`);
      setStatus("done");
      trackEvent("email_signup", { signup_location: "home" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-lg font-semibold" aria-live="polite">
        You&apos;re in — talk soon. 🎉
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <label htmlFor="email-signup" className="sr-only">
        Email address
      </label>
      <input
        id="email-signup"
        type="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (status === "error") setStatus("idle");
        }}
        placeholder="you@example.com"
        className="h-12 flex-1 rounded-full border border-border bg-card/70 px-5 text-base outline-none transition-colors focus:border-mode/60"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="h-12 shrink-0 rounded-full bg-mode px-6 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "sending" ? "Joining…" : "Keep me posted"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-500 sm:absolute sm:mt-14" aria-live="polite">
          That didn&apos;t go through — try again in a moment.
        </p>
      )}
    </form>
  );
}
