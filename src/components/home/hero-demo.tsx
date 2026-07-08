"use client";

import { Fragment, useEffect, useState } from "react";
import { Check, Mic } from "lucide-react";
import type { ModeKey } from "@/lib/content";

/**
 * Self-playing demo of the live word-highlight effect — the signature
 * mechanic sells itself on the marketing home. Lines are real affirmations
 * from the content library, one per mode, cycling with that mode's accent.
 */
const DEMO_LINES: ReadonlyArray<{ mode: ModeKey; text: string }> = [
  { mode: "powerUp", text: "I am a clear and confident leader." },
  { mode: "breakIt", text: "My attention is mine to control." },
  { mode: "primeMe", text: "I bring clarity and calm into this conversation." },
];

const WORD_INTERVAL_MS = 380;
const LINE_LEAD_IN_MS = 1100;
const VERIFIED_HOLD_MS = 2600;

export function HeroDemo() {
  const [line, setLine] = useState(0);
  const [spoken, setSpoken] = useState(0);
  const current = DEMO_LINES[line];
  const words = current.text.split(" ");
  const verified = spoken >= words.length;

  useEffect(() => {
    const delay = verified
      ? VERIFIED_HOLD_MS
      : spoken === 0
        ? LINE_LEAD_IN_MS
        : WORD_INTERVAL_MS;
    const timer = setTimeout(() => {
      if (verified) {
        setLine((prev) => (prev + 1) % DEMO_LINES.length);
        setSpoken(0);
      } else {
        setSpoken((prev) => prev + 1);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [spoken, verified]);

  return (
    <div
      data-mode={current.mode}
      className="relative mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-border/60 bg-card/70 px-6 py-10 shadow-xl backdrop-blur-sm sm:px-10"
      aria-label="Demo of live word verification"
    >
      <div
        className={`flex size-14 items-center justify-center rounded-full bg-mode text-mode-foreground shadow-lg transition-transform ${
          verified ? "" : "mic-listening"
        }`}
        aria-hidden
      >
        {verified ? <Check className="size-6" /> : <Mic className="size-6" />}
      </div>
      <p className="font-display mt-6 min-h-24 max-w-xl text-balance text-center text-2xl font-bold leading-snug tracking-tight sm:text-4xl sm:leading-snug">
        {words.map((word, i) => (
          <Fragment key={`${line}-${i}`}>
            <span className={`affirmation-word ${i < spoken ? "spoken" : ""}`}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </p>
      <p
        className={`mt-4 text-sm font-semibold transition-opacity duration-300 ${
          verified ? "text-mode-2 opacity-100" : "text-muted-foreground opacity-70"
        }`}
        aria-live="polite"
      >
        {verified ? "Every word verified ✓" : "Listening… say it out loud"}
      </p>
    </div>
  );
}
