"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
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
 * scan the possibilities, lock onto one, they resolve into view, they send the
 * one line they are cleared to send, you read it back to confirm it arrived,
 * then you come back through the same door carrying it. The same doorway every
 * time is what makes a daily practice out of a feature
 * (docs/roadmap/phase-3-portal.md, decisions 9 and 10).
 *
 * Reading it back is not decoration: it is the radio read-back handshake, which
 * is why word-for-word verification exists at all.
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
 * Glimpses of other lives, cutting past before one locks. The same person in
 * five different lives — one generated identity carried across five scenes, so
 * the multiverse reads as *hers* rather than as five stock models. Abstract
 * icons could never sell that; recognising the same face is the whole effect.
 *
 * Kept as a module constant (not generated in render) — the React Compiler
 * lint forbids impure calls during render, and a fixed set also keeps SSR and
 * client markup equal.
 */
const VERSES: ReadonlyArray<{ label: string; hue: number; src: string }> = [
  { label: "the one who trains at five", hue: 30, src: "/portal/trains.webp" },
  { label: "the one who shipped it", hue: 265, src: "/portal/shipped.webp" },
  { label: "the one who finally said no", hue: 348, src: "/portal/saidno.webp" },
  { label: "the one who paid it off", hue: 150, src: "/portal/paidoff.webp" },
  {
    label: "the one who sleeps through the night",
    hue: 225,
    src: "/portal/slept.webp",
  },
];

/** The life the signal locks onto — the craft persona, matching PERSONA below. */
const LOCKED_PORTRAIT = "/portal/shipped.webp";

/**
 * The pre-baked persona. On /portal this comes from the visitor's own answers.
 *
 * The guide operates under restriction: they are not allowed to send
 * specifics, only instruction. That constraint is load-bearing in three ways —
 * it keeps the app honest (we genuinely cannot know anyone's future), it makes
 * serving the effort-draining fantasy structurally impossible, and it gives
 * the character a voice. See docs/roadmap/phase-3-portal.md, decision 10.
 */
const PERSONA = {
  domain: "craft",
  horizon: "twelve months from now",
  // The redacted fragment shows the restriction instead of merely stating it.
  saidBefore: "I could tell you how",
  redacted: "it turns out",
  saidAfter: ", but those are not the rules. What I can give you is the morning.",
  promise: "I start before I feel ready.",
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
      className="dark relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16 text-foreground sm:py-20"
      aria-label="Demo: reaching your future self and reading back the line they send"
    >
      {/* The field. Bleeds well past the content — there is no card edge for
          it to stop at, which is the point: the portal is the page, not a
          widget sitting on it. The page root clips horizontal overflow. */}
      <div
        className="portal-night grain pointer-events-none absolute -inset-x-48 -inset-y-40 -z-20"
        aria-hidden
      />
      <div
        className={`portal-field pointer-events-none absolute -inset-x-40 -inset-y-24 -z-10 ${
          isLocking ? "portal-locking" : ""
        } ${showPortrait ? "opacity-50" : ""}`}
        aria-hidden
      />

      <button
        type="button"
        onClick={toggleSound}
        className="absolute right-0 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-border/40 bg-background/40 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        aria-label={soundOn ? "Mute the demo" : "Turn on sound"}
        aria-pressed={soundOn}
      >
        {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      </button>

      {/* Stage: the doorway, the possibilities cutting past, or the one who
          locked in. Exactly one at a time. */}
      <div className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
        {showDoorway ? (
          <Image
            src="/portal/doorway.webp"
            alt=""
            width={604}
            height={900}
            priority
            className={`h-full w-auto object-contain mix-blend-screen ${
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
                // Each life carries its own hue.
                "--mode-accent": `oklch(0.6 0.18 ${VERSES[verseIndex].hue})`,
                "--mode-accent-2": `oklch(0.72 0.13 ${VERSES[verseIndex].hue})`,
              } as React.CSSProperties
            }
            aria-hidden
          >
            <div className="transmission relative size-40 overflow-hidden rounded-2xl sm:size-52">
              <Image
                src={VERSES[verseIndex].src}
                alt=""
                fill
                sizes="(min-width: 640px) 13rem, 10rem"
                priority
                className="object-cover"
              />
            </div>
            <span className="mt-3 max-w-[12rem] text-balance text-center text-[10px] font-semibold uppercase leading-tight tracking-widest text-white/70 sm:text-xs">
              {VERSES[verseIndex].label}
            </span>
          </div>
        ) : null}

        {showPortrait ? (
          <div className="resolving transmission relative size-44 overflow-hidden rounded-full sm:size-56">
            <Image
              src={portraitSrc ?? LOCKED_PORTRAIT}
              alt="The future self the signal locked onto"
              fill
              sizes="(min-width: 640px) 14rem, 11rem"
              priority
              className="object-cover"
            />
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
              &ldquo;{PERSONA.saidBefore}{" "}
              <span className="redacted" aria-label="redacted">
                {PERSONA.redacted}
              </span>
              {PERSONA.saidAfter}&rdquo;
            </p>
          </>
        ) : null}

        {showPromise ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
              {phase === "returning" ? "Take it into today" : "Read it back"}
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
          ? "Received. Word for word."
          : phase === "yourTurn"
            ? "Listening... read it back"
            : phase === "returning"
              ? "Same door tomorrow."
              : " "}
      </p>
    </div>
  );
}
