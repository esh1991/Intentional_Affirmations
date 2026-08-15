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
 * The sequence is a closed ritual, not a highlight reel — cross the threshold,
 * scan the possibilities, lock onto one, they resolve into view, they speak,
 * you say it back and the words light up, then you come back through the same
 * door carrying the line. The same doorway every time is what makes a daily
 * practice out of a feature (docs/roadmap/phase-3-portal.md, decision 9).
 */

type Phase =
  | "threshold"
  | "scanning"
  | "locking"
  | "revealing"
  | "speaking"
  | "yourTurn"
  | "sealed"
  | "returning";

/**
 * Glimpses of other lives, flickering past before one locks. Kept as a module
 * constant (not generated in render) — the React Compiler lint forbids impure
 * calls during render, and a fixed set also keeps SSR and client markup equal.
 */
const VERSES: ReadonlyArray<{ label: string; hue: number }> = [
  { label: "the one who trains at five", hue: 30 },
  { label: "the one who shipped it", hue: 265 },
  { label: "the one who finally said no", hue: 348 },
  { label: "the one who paid it off", hue: 150 },
  { label: "the one who sleeps through the night", hue: 225 },
];

/** The pre-baked persona. On /portal this comes from the user's own answers. */
const PERSONA = {
  domain: "craft",
  horizon: "twelve months from now",
  // Warmth plus friction: the future self names the obstacle rather than
  // glowing about the destination. Positive fantasy alone reduces effort.
  line: "I still felt like putting it off. I said this out loud and started anyway.",
  promise: "I finish what I start.",
} as const;

const PHASE_MS: Record<Phase, number> = {
  threshold: 2400,
  scanning: 3000,
  locking: 2400,
  revealing: 1400,
  speaking: 3800,
  yourTurn: 0, // driven per-word instead
  sealed: 2600,
  returning: 2600,
};

const WORD_INTERVAL_MS = 420;

const CAPTIONS: Partial<Record<Phase, string>> = {
  threshold: "Step through.",
  scanning: "Scanning for a version of you...",
  locking: "Locking on...",
  revealing: "Connected.",
  returning: "Come back. Bring it with you.",
};

/**
 * Placeholder for the generated portrait: a lit bust, graded as a
 * transmission. Abstract on purpose — the marketing page should never imply
 * a real person's photo, and the real payload is the visitor's own face on
 * /portal.
 */
function SilhouettePortrait({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  // Gradient ids must be unique per instance: duplicate ids in one document
  // all resolve to the first definition, which would render every possible
  // life in the same hue.
  const gradientId = `portal-bust-${id}`;
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden>
      <defs>
        {/* userSpaceOnUse so the head and the shoulders share one continuous
            ramp. Object-bounding-box gradients restart per shape, which draws
            a visible seam where the two meet. */}
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="16"
          x2="0"
          y2="140"
        >
          <stop offset="0%" stopColor="var(--mode-accent)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--mode-accent-2)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Shoulders rise to y=70, just above the head's base at y=72, so the
          bust reads as one figure rather than a floating head. */}
      <path d="M14 140c0-38 20.6-70 46-70s46 32 46 70Z" fill={`url(#${gradientId})`} />
      <circle cx="60" cy="46" r="26" fill={`url(#${gradientId})`} />
    </svg>
  );
}

export function PortalDemo({ portraitSrc }: { portraitSrc?: string }) {
  const [phase, setPhase] = useState<Phase>("threshold");
  const [spoken, setSpoken] = useState(0);
  const [verseIndex, setVerseIndex] = useState(0);
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
      threshold: "scanning",
      scanning: "locking",
      locking: "revealing",
      revealing: "speaking",
      speaking: "yourTurn",
      sealed: "returning",
      returning: "threshold",
    };
    const timer = setTimeout(() => {
      if (phase === "returning") setSpoken(0);
      setPhase(NEXT[phase]);
    }, PHASE_MS[phase]);
    return () => clearTimeout(timer);
  }, [phase, spoken, words.length]);

  /**
   * The verse-jump. One possible life on screen at a time, swapped on a hard
   * cut — overlapping cross-fades read as mush, and the cut is the whole
   * point. The cuts slow as the signal locks on, so the sequence lands rather
   * than simply stopping.
   */
  useEffect(() => {
    if (phase !== "scanning" && phase !== "locking") return;
    // Effect-only read: matchMedia during render would break SSR.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let cancelled = false;
    let step = 0;
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      if (cancelled) return;
      setVerseIndex((n) => (n + 1) % VERSES.length);
      step += 1;
      timer = setTimeout(
        advance,
        phase === "scanning" ? 150 : Math.min(150 + step * 55, 620),
      );
    };
    timer = setTimeout(advance, phase === "scanning" ? 150 : 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase]);

  // Audio cues ride alongside the phases. Silence is load-bearing: the bed
  // drops out the moment it is your turn to speak.
  useEffect(() => {
    if (!soundOnRef.current) return;
    if (phase === "threshold") startDrone();
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
  const showDoorway = phase === "threshold" || phase === "returning";
  const showVerses = isScanning || isLocking;
  const showPortrait =
    phase === "revealing" ||
    phase === "speaking" ||
    phase === "yourTurn" ||
    phase === "sealed";
  const yourTurn = phase === "yourTurn" || phase === "sealed";
  const sealed = phase === "sealed";
  // The line stays on screen through the return — carrying it back out is the
  // whole point of closing the ritual rather than just stopping.
  const showPromise = yourTurn || phase === "returning";

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

      {/* Stage: the doorway, the possibilities cutting past, or the one who
          locked in. Exactly one at a time. */}
      <div className="relative flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
        {showDoorway ? (
          <div
            className={`doorway ${
              phase === "threshold" ? "doorway-opening" : "doorway-closing"
            }`}
            aria-hidden
          />
        ) : null}

        {showVerses ? (
          <div
            // Keying on the index forces a genuine remount per cut — no
            // interpolation between one life and the next.
            key={verseIndex}
            className={`absolute inset-0 flex flex-col items-center justify-center ${
              isScanning || isLocking ? "verse-cut" : ""
            }`}
            style={
              {
                // Each possibility carries its own hue — a different life.
                "--mode-accent": `oklch(0.6 0.18 ${VERSES[verseIndex].hue})`,
                "--mode-accent-2": `oklch(0.72 0.13 ${VERSES[verseIndex].hue})`,
              } as React.CSSProperties
            }
            aria-hidden
          >
            <SilhouettePortrait
              id={`verse-${verseIndex}`}
              className="h-24 w-20 sm:h-28 sm:w-24"
            />
            <span className="mt-2 max-w-[10rem] text-balance text-center text-[10px] font-semibold uppercase leading-tight tracking-widest text-muted-foreground sm:text-xs">
              {VERSES[verseIndex].label}
            </span>
          </div>
        ) : null}

        {showPortrait ? (
          <div className="resolving transmission relative flex size-36 items-center justify-center overflow-hidden rounded-full sm:size-44">
            {portraitSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitSrc}
                alt="A rendered portrait of a future self"
                className="size-full object-cover"
              />
            ) : (
              <SilhouettePortrait id="locked" className="size-full" />
            )}
          </div>
        ) : null}
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

        {showPromise ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
              {phase === "returning" ? "Carry it into today" : "Say it with them"}
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
