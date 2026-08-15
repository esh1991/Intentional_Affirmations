"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Check, Mic, Volume2, VolumeX } from "lucide-react";
import {
  playChordResolve,
  playLockTone,
  playWordNote,
  riseDrone,
  setMuted,
  startDrone,
  stopDrone,
  unlockAudio,
} from "@/lib/audio";

/**
 * The self-playing portal demo — the marketing front door and, deliberately,
 * the short-form video asset (docs/PLAN.md asks for one; this is it).
 *
 * It runs the entire product in about twenty seconds with zero AI cost: a
 * pre-baked persona, no sign-in, no generation. The portrait is a prop, so
 * swapping the silhouette for a real generated demo portrait later is a
 * one-line change and nothing else moves.
 *
 * Sequence: scan the possibilities, lock onto one, they resolve into view,
 * they speak, you say it back and the words light up, the chord lands.
 */

type Phase = "scanning" | "locking" | "revealing" | "speaking" | "yourTurn" | "sealed";

/**
 * Glimpses of other lives, flickering past before one locks. Kept as a module
 * constant (not generated in render) — the React Compiler lint forbids impure
 * calls during render, and a fixed set also keeps SSR and client markup equal.
 */
const VERSES: ReadonlyArray<{ label: string; hue: number; delay: string }> = [
  { label: "the one who trains at five", hue: 30, delay: "0s" },
  { label: "the one who shipped it", hue: 265, delay: "0.13s" },
  { label: "the one who finally said no", hue: 348, delay: "0.27s" },
  { label: "the one who paid it off", hue: 150, delay: "0.41s" },
  { label: "the one who sleeps through the night", hue: 225, delay: "0.55s" },
];

/** The pre-baked persona. On /portal this comes from the user's own answers. */
const PERSONA = {
  domain: "craft",
  horizon: "twelve months from now",
  line: "I stopped waiting to feel ready. I just started saying it.",
  promise: "I finish what I start.",
} as const;

const PHASE_MS: Record<Phase, number> = {
  scanning: 3400,
  locking: 2400,
  revealing: 1400,
  speaking: 3200,
  yourTurn: 0, // driven per-word instead
  sealed: 3400,
};

const WORD_INTERVAL_MS = 420;

const CAPTIONS: Partial<Record<Phase, string>> = {
  scanning: "Scanning for a version of you...",
  locking: "Locking on...",
  revealing: "Connected.",
};

/**
 * Placeholder for the generated portrait: a lit bust, graded as a
 * transmission. Abstract on purpose — the marketing page should never imply
 * a real person's photo, and the real payload is the visitor's own face on
 * /portal.
 */
function SilhouettePortrait({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden>
      <defs>
        <linearGradient id="portal-bust" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--mode-accent)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--mode-accent-2)" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="46" r="26" fill="url(#portal-bust)" />
      <path d="M12 140c0-28 21-46 48-46s48 18 48 46Z" fill="url(#portal-bust)" />
    </svg>
  );
}

export function PortalDemo({ portraitSrc }: { portraitSrc?: string }) {
  const [phase, setPhase] = useState<Phase>("scanning");
  const [spoken, setSpoken] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);

  const words = PERSONA.promise.split(" ");

  // Sound is off until the visitor asks for it: browsers block autoplay
  // anyway, and an unannounced drone on a marketing page is hostile.
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

  // Phase timeline. `yourTurn` advances a word at a time; every other phase
  // holds for a fixed beat and then hands over.
  useEffect(() => {
    if (phase === "yourTurn") {
      const done = spoken >= words.length;
      const timer = setTimeout(
        () => {
          if (done) setPhase("sealed");
          else setSpoken((n) => n + 1);
        },
        done ? 700 : WORD_INTERVAL_MS,
      );
      return () => clearTimeout(timer);
    }

    const NEXT: Record<Exclude<Phase, "yourTurn">, Phase> = {
      scanning: "locking",
      locking: "revealing",
      revealing: "speaking",
      speaking: "yourTurn",
      sealed: "scanning",
    };
    const timer = setTimeout(() => {
      if (phase === "sealed") setSpoken(0);
      setPhase(NEXT[phase]);
    }, PHASE_MS[phase]);
    return () => clearTimeout(timer);
  }, [phase, spoken, words.length]);

  // Audio cues ride alongside the phases. Silence is load-bearing: the bed
  // drops out the moment it is your turn to speak.
  useEffect(() => {
    if (!soundOnRef.current) return;
    if (phase === "scanning") startDrone();
    else if (phase === "locking") riseDrone(2.2);
    else if (phase === "revealing") {
      stopDrone(0.5);
      playLockTone();
    } else if (phase === "sealed") playChordResolve();
  }, [phase]);

  useEffect(() => {
    if (!soundOnRef.current) return;
    if (phase === "yourTurn" && spoken > 0 && spoken <= words.length) {
      playWordNote(spoken - 1);
    }
  }, [phase, spoken, words.length]);

  // Stop the drone if the component unmounts mid-scan.
  useEffect(() => () => stopDrone(0.1), []);

  const isScanning = phase === "scanning";
  const isLocking = phase === "locking";
  const showPortrait =
    phase === "revealing" ||
    phase === "speaking" ||
    phase === "yourTurn" ||
    phase === "sealed";
  const yourTurn = phase === "yourTurn" || phase === "sealed";
  const sealed = phase === "sealed";

  return (
    <div
      data-mode={PERSONA.domain}
      className="grain relative mx-auto flex w-full max-w-2xl flex-col items-center overflow-hidden rounded-3xl border border-border/60 bg-card/70 px-6 py-10 shadow-xl backdrop-blur-sm sm:px-10"
      aria-label="Demo: reaching your future self and speaking their promise"
    >
      {/* The field */}
      <div
        className={`portal-field pointer-events-none absolute inset-0 -z-10 ${
          isLocking ? "portal-locking" : ""
        } ${showPortrait ? "opacity-40" : ""}`}
        aria-hidden
      />

      <button
        type="button"
        onClick={toggleSound}
        className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={soundOn ? "Mute the demo" : "Turn on sound"}
        aria-pressed={soundOn}
      >
        {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      </button>

      {/* Stage: either the possibilities flickering, or the one who locked in. */}
      <div className="relative flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
        {!showPortrait &&
          VERSES.map((verse) => (
            <div
              key={verse.label}
              className={`absolute inset-0 flex flex-col items-center justify-center ${
                isScanning || isLocking ? "verse-flicker" : ""
              }`}
              style={{
                animationDelay: verse.delay,
                // Each possibility carries its own hue — a different life.
                "--mode-accent": `oklch(0.58 0.18 ${verse.hue})`,
              } as React.CSSProperties}
              aria-hidden
            >
              <SilhouettePortrait className="h-28 w-24 opacity-80 sm:h-32 sm:w-28" />
              <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs">
                {verse.label}
              </span>
            </div>
          ))}

        {showPortrait && (
          <div className="resolving transmission relative flex size-36 items-center justify-center overflow-hidden rounded-full sm:size-44">
            {portraitSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitSrc}
                alt="A rendered portrait of a future self"
                className="size-full object-cover"
              />
            ) : (
              <SilhouettePortrait className="size-full" />
            )}
          </div>
        )}
      </div>

      {/* Caption / dialogue / the promise */}
      <div className="mt-6 flex min-h-28 w-full max-w-xl flex-col items-center justify-center text-center">
        {CAPTIONS[phase] ? (
          <p
            className={`text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground ${
              isLocking ? "aberrating" : ""
            }`}
            aria-live="polite"
          >
            {CAPTIONS[phase]}
          </p>
        ) : null}

        {phase === "speaking" ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
              You, {PERSONA.horizon}
            </p>
            <p className="font-display transmission-voice mt-3 text-balance text-lg leading-relaxed sm:text-xl">
              &ldquo;{PERSONA.line}&rdquo;
            </p>
          </>
        ) : null}

        {yourTurn ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
              Say it with them
            </p>
            <p className="font-display mt-3 text-balance text-2xl font-bold leading-snug tracking-tight sm:text-4xl sm:leading-snug">
              {words.map((word, i) => (
                <Fragment key={i}>
                  <span className={`affirmation-word ${i < spoken ? "spoken" : ""}`}>
                    {word}
                  </span>
                  {i < words.length - 1 ? " " : null}
                </Fragment>
              ))}
            </p>
          </>
        ) : null}
      </div>

      {/* Mic state — the same signal the real practice screen shows. */}
      <div
        className={`mt-2 flex size-12 items-center justify-center rounded-full transition-colors ${
          yourTurn
            ? "bg-mode text-mode-foreground shadow-lg"
            : "bg-muted text-muted-foreground"
        } ${phase === "yourTurn" ? "mic-listening" : ""}`}
        aria-hidden
      >
        {sealed ? <Check className="size-5" /> : <Mic className="size-5" />}
      </div>
      <p className="mt-3 text-sm font-semibold text-muted-foreground" aria-live="polite">
        {sealed
          ? "Every word verified"
          : phase === "yourTurn"
            ? "Listening... say it out loud"
            : " "}
      </p>
    </div>
  );
}
