"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import {
  DOMAIN_LIST,
  HORIZONS,
  type Coordinates,
  type DomainKey,
  type HorizonKey,
  horizonPhrase,
  saveCoordinates,
} from "@/lib/portal/domains";
import { guideMessage, promiseFor } from "@/lib/portal/guide";
import { BringIntoFocus, PortraitImage } from "@/components/portal/bring-into-focus";
import {
  playChordResolve,
  playLockTone,
  riseDrone,
  setMuted,
  startDrone,
  stopDrone,
  unlockAudio,
} from "@/lib/audio";
import { playClick } from "@/lib/sound";
import { trackEvent } from "@/lib/analytics";

/**
 * The portal: tune → cross → scan → contact → the line they are cleared to
 * send → out through the same door, carrying it.
 *
 * Deliberately works WITHOUT a generated portrait. The portrait is the hook;
 * the rep is the product (docs/roadmap/phase-3-portal.md) — a portal that
 * stops at the portrait is the exact failure mental-contrasting research
 * describes. So the whole sequence runs today, and the portrait lights up in
 * its reserved slot once FAL_KEY and the blob store exist.
 *
 * Tuning stays anonymous: it costs nothing. Sign-in is required only for the
 * portrait, which is the step that spends money — the gate lands where desire
 * peaks and reads as narrative rather than friction.
 */

type Step =
  | "tune"
  | "crossing"
  | "scanning"
  | "contact"
  | "focus"
  | "promise";

const SCAN_MS = 3200;
const CROSS_MS = 2200;

/** Placeholder scan frames — the same five lives the home demo cuts through. */
const SCAN_FRAMES = [
  "/portal/trains.webp",
  "/portal/shipped.webp",
  "/portal/saidno.webp",
  "/portal/paidoff.webp",
  "/portal/slept.webp",
];

export function PortalFlow() {
  const [step, setStep] = useState<Step>("tune");
  const [domain, setDomain] = useState<DomainKey | null>(null);
  const [goal, setGoal] = useState("");
  const [horizon, setHorizon] = useState<HorizonKey>("1y");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [frame, setFrame] = useState(0);
  // Set once a portrait exists; until then the stand-in stands in.
  const [futureSelfId, setFutureSelfId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      soundOnRef.current = next;
      setMuted(!next);
      if (next) unlockAudio();
      else stopDrone(0.2);
      return next;
    });
  }, []);

  const open = useCallback(() => {
    if (!domain) return;
    playClick();
    unlockAudio();
    const saved = saveCoordinates({ domain, goal: goal.trim(), horizon });
    setCoords(saved);
    setStep("crossing");
    trackEvent("portal_opened", { domain, horizon });
  }, [domain, goal, horizon]);

  // Sequence timing.
  useEffect(() => {
    if (step === "crossing") {
      const t = setTimeout(() => setStep("scanning"), CROSS_MS);
      return () => clearTimeout(t);
    }
    if (step === "scanning") {
      const t = setTimeout(() => setStep("contact"), SCAN_MS);
      return () => clearTimeout(t);
    }
    if (step === "contact") {
      // The offer lands here, right after they hear from them — where wanting
      // to see the face is strongest.
      const t = setTimeout(() => setStep("focus"), 4600);
      return () => clearTimeout(t);
    }
  }, [step]);

  // The verse-jump, same grammar as the home demo: a hard cut per life.
  useEffect(() => {
    if (step !== "scanning") return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(
      () => setFrame((n) => (n + 1) % SCAN_FRAMES.length),
      170,
    );
    return () => clearInterval(id);
  }, [step]);

  // Audio bed. Silence when it matters.
  useEffect(() => {
    if (!soundOnRef.current) return;
    if (step === "crossing") startDrone();
    else if (step === "scanning") riseDrone(3);
    else if (step === "contact") {
      stopDrone(0.5);
      playLockTone();
    } else if (step === "promise") playChordResolve();
  }, [step]);

  useEffect(() => () => stopDrone(0.1), []);

  const message = coords ? guideMessage(coords.domain) : null;
  const promise = coords ? promiseFor(coords.domain) : null;

  /* ---------------------------------------------------------------- *
   * Tuning
   * ---------------------------------------------------------------- */
  if (step === "tune") {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-16">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Before we go looking
        </p>
        <h1 className="font-display mt-4 text-balance text-center text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Which version of you should we reach?
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-center text-muted-foreground">
          They can&apos;t tell you how it turns out. They can tell you what to
          do next. Name the life and we&apos;ll go find them.
        </p>

        {/* Domain */}
        <fieldset className="mt-10">
          <legend className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            The part of your life
          </legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {DOMAIN_LIST.map((d) => (
              <button
                key={d.key}
                type="button"
                data-mode={d.key}
                onClick={() => {
                  setDomain(d.key);
                  playClick();
                }}
                aria-pressed={domain === d.key}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  domain === d.key
                    ? "border-mode bg-mode/10 shadow-lg"
                    : "border-border/60 bg-card hover:border-mode/50"
                }`}
              >
                <span className="text-sm font-semibold uppercase tracking-widest text-mode-2">
                  {d.label}
                </span>
                <span className="font-display mt-2 block text-balance text-lg font-semibold leading-snug">
                  {d.prompt}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Goal */}
        {domain ? (
          <div data-mode={domain} className="mt-8">
            <label
              htmlFor="portal-goal"
              className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
            >
              What did they do that you haven&apos;t yet?
            </label>
            <input
              id="portal-goal"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              maxLength={120}
              placeholder={DOMAINS_EXAMPLE(domain)}
              className="mt-3 w-full rounded-2xl border border-border bg-card px-5 py-4 text-base outline-none transition-colors focus:border-mode"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Optional — but the more specific you are, the less they have to
              guess.
            </p>

            <fieldset className="mt-8">
              <legend className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                How far ahead are they?
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {HORIZONS.map((h) => (
                  <button
                    key={h.key}
                    type="button"
                    onClick={() => {
                      setHorizon(h.key);
                      playClick();
                    }}
                    aria-pressed={horizon === h.key}
                    className={`rounded-full border px-6 py-3 font-semibold transition-colors ${
                      horizon === h.key
                        ? "border-mode bg-mode text-mode-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={open}
              className="mt-10 w-full rounded-full bg-mode px-8 py-4 text-lg font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Open the channel
            </button>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              No account needed. Nothing to install.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   * The sequence
   * ---------------------------------------------------------------- */
  return (
    <div
      data-mode={coords?.domain ?? "portal"}
      className="dark relative mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-foreground"
    >
      <div
        className="portal-night grain pointer-events-none absolute -inset-x-48 -inset-y-24 -z-20"
        aria-hidden
      />
      <div
        className={`portal-field pointer-events-none absolute -inset-x-40 -inset-y-16 -z-10 ${
          step === "scanning" ? "portal-locking" : ""
        }`}
        aria-hidden
      />

      <button
        type="button"
        onClick={toggleSound}
        className="absolute right-2 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-border/40 bg-background/40 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        aria-label={soundOn ? "Mute" : "Turn on sound"}
        aria-pressed={soundOn}
      >
        {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      </button>

      {/* Stage */}
      <div className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
        {step === "crossing" ? (
          <Image
            src="/portal/doorway.webp"
            alt=""
            width={604}
            height={900}
            priority
            className="doorway-opening h-full w-auto object-contain mix-blend-screen"
            aria-hidden
          />
        ) : null}

        {step === "scanning" ? (
          <div key={frame} className="verse-cut absolute inset-0 flex items-center justify-center">
            <div className="transmission relative size-44 overflow-hidden rounded-2xl sm:size-56">
              <Image
                src={SCAN_FRAMES[frame]}
                alt=""
                fill
                sizes="14rem"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        {step === "contact" || step === "focus" || step === "promise" ? (
          <div className="resolving transmission relative size-48 overflow-hidden rounded-full sm:size-60">
            {futureSelfId ? (
              <PortraitImage
                futureSelfId={futureSelfId}
                className="size-full object-cover"
              />
            ) : (
              <Image
                src="/portal/shipped.webp"
                alt="A stand-in for the version of you the channel reached"
                fill
                sizes="15rem"
                priority
                className="object-cover"
              />
            )}
          </div>
        ) : null}
      </div>

      {/* Words */}
      <div className="mt-8 flex w-full max-w-xl flex-col items-center text-center">
        {step === "crossing" ? (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Step through.
          </p>
        ) : null}

        {step === "scanning" ? (
          <p className="aberrating text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Looking for them&hellip;
          </p>
        ) : null}

        {(step === "contact" || step === "promise") && coords && message ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
              You, {horizonPhrase(coords.horizon)}
            </p>
            <p className="font-display transmission-voice mt-4 text-balance text-lg leading-relaxed sm:text-xl">
              &ldquo;{message.before}{" "}
              <span className="redacted" aria-label="redacted">
                {message.redacted}
              </span>
              {message.after}&rdquo;
            </p>
          </>
        ) : null}

        {step === "focus" && coords ? (
          <div className="mt-8 flex w-full justify-center">
            <BringIntoFocus
              coords={coords}
              onDone={(id) => {
                setFutureSelfId(id);
                setStep("promise");
              }}
              onSkip={() => setStep("promise")}
            />
          </div>
        ) : null}

        {step === "promise" && promise ? (
          <div className="mt-10 w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
              One line is cleared to send
            </p>
            <p className="font-display mt-4 text-balance text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
              {promise.affirmation.split(" ").map((word, i, all) => (
                <Fragment key={i}>
                  <span className="affirmation-word spoken">{word}</span>
                  {i < all.length - 1 ? " " : null}
                </Fragment>
              ))}
            </p>
            <Link
              href="/pact"
              onClick={() => {
                playClick();
                trackEvent("portal_promise_accepted", { domain: promise.mode });
              }}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-mode px-8 py-4 text-lg font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Read it back out loud
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              One a day, through the same door.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Placeholder text for the goal field, per domain. */
function DOMAINS_EXAMPLE(domain: DomainKey): string {
  return DOMAIN_LIST.find((d) => d.key === domain)?.example ?? "";
}
