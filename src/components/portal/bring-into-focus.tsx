"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Loader2, ShieldCheck } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { Coordinates } from "@/lib/portal/domains";
import { trackEvent } from "@/lib/analytics";
import { playClick } from "@/lib/sound";

/**
 * "Bring them into focus" — the one step that costs money, and the only one
 * behind sign-in. The gate lands here on purpose: tuning and the conversation
 * are free and stay anonymous, so the account ask arrives where desire peaks
 * rather than at the front door.
 *
 * Always skippable. The reveal is the hook; the rep is the product, and a
 * portal that dead-ends without a photo would be the exact failure the
 * mental-contrasting research describes.
 */

const MAX_BYTES = 6 * 1024 * 1024;
const ACCEPTED = "image/jpeg,image/png,image/webp";

/**
 * Renders a private portrait.
 *
 * Portraits are private blobs read through an authenticated route, and an
 * `<img src>` cannot carry an Authorization header — so the bytes are fetched
 * with the bearer token and handed to the tag as an object URL. Revoked on
 * unmount so the blob doesn't leak for the life of the tab.
 */
export function PortraitImage({
  futureSelfId,
  className,
}: {
  futureSelfId: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    const supabase = getSupabase();
    if (!supabase) return;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch(`/api/portal/portrait/${futureSelfId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok || cancelled) return;
      objectUrl = URL.createObjectURL(await res.blob());
      if (cancelled) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setSrc(objectUrl);
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [futureSelfId]);

  if (!src) return <div className={className} aria-hidden />;
  // An object URL, not a remote source: next/image would re-request it and
  // drop the auth header, so the optimizer is the wrong tool here.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="The version of you the channel reached" className={className} />;
}

export function BringIntoFocus({
  coords,
  onDone,
  onSkip,
}: {
  coords: Coordinates;
  onDone: (futureSelfId: string) => void;
  onSkip: () => void;
}) {
  const { session, loading } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const pick = useCallback((chosen: File | null) => {
    setError(null);
    if (!chosen) return;
    if (chosen.size > MAX_BYTES) {
      setError("That photo is over 6MB — try a smaller one.");
      return;
    }
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  }, []);

  const submit = useCallback(async () => {
    if (!file || !consented) return;
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("no session");

      const body = new FormData();
      body.append("selfie", file);
      body.append("domain", coords.domain);
      body.append("goal", coords.goal);
      body.append("horizon", coords.horizon);

      const res = await fetch("/api/portal/portrait", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const json = (await res.json()) as { futureSelfId?: string; error?: string };
      if (!res.ok || !json.futureSelfId) {
        throw new Error(json.error ?? "Couldn't bring them into focus.");
      }
      trackEvent("portrait_generated", { domain: coords.domain });
      onDone(json.futureSelfId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }, [file, consented, coords, onDone]);

  /* ---- Signed out: the gate ---------------------------------------- */
  if (!loading && !session) {
    return (
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
          One more thing
        </p>
        <h2 className="font-display mt-4 text-balance text-2xl font-bold leading-snug sm:text-3xl">
          Want to see their face?
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          We can bring them into focus from a photo of you. That part needs an
          account &mdash; it&apos;s the only thing here that does.
        </p>
        <Link
          href="/signin"
          onClick={() => playClick()}
          className="mt-8 rounded-full bg-mode px-8 py-4 text-lg font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          Sign in to see them
        </Link>
        <button
          type="button"
          onClick={onSkip}
          className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Not now &mdash; just give me the line
        </button>
      </div>
    );
  }

  /* ---- Signed in: consent + upload ---------------------------------- */
  return (
    <div className="flex w-full max-w-md flex-col items-center text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
        Bring them into focus
      </p>
      <h2 className="font-display mt-4 text-balance text-2xl font-bold leading-snug sm:text-3xl">
        Give them your face to work from.
      </h2>

      {preview ? (
        <div className="transmission mt-7 size-40 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
          <img src={preview} alt="The photo you chose" className="size-full object-cover" />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          playClick();
          inputRef.current?.click();
        }}
        className="mt-7 flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 font-semibold transition-colors hover:bg-card"
      >
        <Camera className="size-5" aria-hidden />
        {file ? "Choose a different photo" : "Choose a photo"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        A clear photo of your face. JPEG, PNG or WebP, up to 6MB.
      </p>

      {/*
        The consent copy is deliberately specific rather than reassuring. It
        names the third party, because "we never keep your photo" is true of
        our storage and would be misleading on its own.
      */}
      <label className="mt-7 flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 text-left">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-1 size-4 shrink-0 accent-current"
        />
        <span className="text-sm leading-relaxed text-muted-foreground">
          <ShieldCheck className="mr-1 inline size-4 text-mode-2" aria-hidden />
          I understand my photo is sent to an AI image provider to create the
          portrait, that <strong className="text-foreground">we never store the photo itself</strong>,
          and that the portrait it makes is kept privately in my account until I
          delete it.
        </span>
      </label>

      {error ? (
        <p className="mt-5 text-sm font-medium text-mode-2" aria-live="polite">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={!file || !consented || busy}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-mode px-8 py-4 text-lg font-semibold text-mode-foreground shadow-lg transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
      >
        {busy ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Finding them&hellip;
          </>
        ) : (
          "Bring them into focus"
        )}
      </button>

      {!busy ? (
        <button
          type="button"
          onClick={onSkip}
          className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Skip &mdash; just give me the line
        </button>
      ) : null}
    </div>
  );
}
