"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { ArrowLeft, Keyboard, Mic, MicOff, RefreshCw, Zap } from "lucide-react";
import type { Affirmation, ModeKey } from "@/lib/content";
import { MODE_META } from "@/lib/content";
import {
  MATCH_SCORE_THRESHOLD,
  type SpeechVerifierError,
} from "@/lib/speech/SpeechVerifier";
import {
  WebSpeechVerifier,
  isSpeechRecognitionAvailable,
} from "@/lib/speech/web-speech-verifier";
import { matchedWordIndices, similarityScore } from "@/lib/speech/similarity";
import { trackEvent } from "@/lib/analytics";
import { addStar } from "@/lib/stars";
import { recordSession } from "@/lib/sessions";
import { recordCompletion } from "@/lib/streak";
import {
  JOURNEY_DURATIONS,
  type JourneyDuration,
  type JourneyState,
  arcIndexForDay,
  completeJourneyDay,
  isCompletedToday,
  isFinished,
  journeyKey,
  nextDay,
  parseJourneys,
  readJourneysRaw,
  startJourney,
} from "@/lib/journeys";
import { JourneyDots } from "@/components/app/journey-dots";
import { useClientValue } from "@/hooks/use-client-value";

type Phase = "ready" | "listening" | "retry" | "success";

interface CompletionState {
  stars: number;
  trophy: boolean;
  streak: number;
  journey: { day: number; duration: number; completed: number } | null;
}

const DURATION_LABELS: Record<JourneyDuration, string> = {
  7: "Kickstart",
  14: "Momentum",
  21: "Deep practice",
};

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-3" aria-label={`${count} of 3 stars earned`}>
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`size-12 sm:size-14 ${
            i < count ? "fill-mode-2 text-mode-2" : "fill-card text-border"
          }`}
          aria-hidden
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

function Shell({
  mode,
  categoryName,
  onNext,
  children,
}: {
  mode: ModeKey;
  categoryName: string;
  onNext?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div data-mode={mode} className="relative isolate flex flex-1 flex-col">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6">
        <Link
          href={`/practice?mode=${mode}`}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {MODE_META[mode].label} / {categoryName}
        </Link>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <RefreshCw className="size-4" aria-hidden />
            New one
          </button>
        )}
      </div>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-16 sm:py-24">
        {children}
      </main>
    </div>
  );
}

export function PracticeScreen({
  mode,
  categoryName,
  items,
  initialIndex,
  journey,
}: {
  mode: ModeKey;
  categoryName: string;
  items: Affirmation[];
  initialIndex: number;
  journey: Affirmation[] | null;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [phase, setPhase] = useState<Phase>("ready");
  const [typing, setTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [matched, setMatched] = useState<ReadonlySet<number>>(new Set());
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [completion, setCompletion] = useState<CompletionState | null>(null);
  const [freeSession, setFreeSession] = useState(false);
  const [pickerOverride, setPickerOverride] = useState(false);

  // Journey state, hydration-safe: null while server-rendering, then the raw
  // localStorage value; mutations set the override so React re-renders.
  const rawFromStorage = useClientValue(readJourneysRaw);
  const [rawOverride, setRawOverride] = useState<string | null>(null);
  const raw = rawOverride ?? rawFromStorage;
  const journeyState: JourneyState | null | undefined = useMemo(() => {
    if (!journey) return null;
    if (raw === null) return undefined; // still hydrating
    return parseJourneys(raw)[journeyKey(mode, categoryName)] ?? null;
  }, [journey, raw, mode, categoryName]);

  const journeyLoading = journey !== null && journeyState === undefined;
  const journeyActive = journey !== null && journeyState != null;
  const journeyDoneToday =
    journeyActive && isCompletedToday(journeyState as JourneyState);
  const journeyComplete =
    journeyActive && isFinished(journeyState as JourneyState);
  const showPicker =
    journey !== null &&
    !journeyLoading &&
    !freeSession &&
    (journeyState === null || pickerOverride);
  const journeySession =
    journeyActive &&
    !freeSession &&
    !pickerOverride &&
    !journeyDoneToday &&
    !journeyComplete;
  const journeyDay = journeySession ? nextDay(journeyState as JourneyState) : null;

  const speechAvailable = useClientValue(isSpeechRecognitionAvailable);
  const verifierRef = useRef<WebSpeechVerifier | null>(null);
  // Verification attempts on the current affirmation (voice results + typed
  // submissions), logged with the session on success.
  const attemptsRef = useRef(0);

  const current: Affirmation =
    journeySession && journey && journeyDay
      ? journey[arcIndexForDay((journeyState as JourneyState).duration, journeyDay)]
      : items[index];
  const words = useMemo(() => current.affirmation.split(" "), [current]);

  const stopVerifier = useCallback(() => {
    verifierRef.current?.stop();
  }, []);
  // Release the mic if the user navigates away mid-listen
  useEffect(() => stopVerifier, [stopVerifier]);

  const succeed = useCallback(
    (matchScore: number, input: "voice" | "typed") => {
      stopVerifier();
      setMatched(new Set(words.map((_, i) => i)));
      const streak = recordCompletion();
      const { stars, trophy } = addStar();
      let journeyResult: CompletionState["journey"] = null;
      if (journeySession && journeyState) {
        setRawOverride(completeJourneyDay(mode, categoryName));
        journeyResult = {
          day: journeyDay as number,
          duration: journeyState.duration,
          completed: journeyState.completedDays.length + 1,
        };
      }
      recordSession({
        affirmation: current.affirmation,
        mode,
        category: categoryName,
        matchScore,
        attempts: attemptsRef.current,
        input,
        completedAt: new Date().toISOString(),
        ...(journeyResult
          ? { journeyDay: journeyResult.day, journeyDuration: journeyResult.duration }
          : {}),
      });
      trackEvent("affirmation_success", {
        mode,
        category: categoryName,
        match_score: matchScore,
        input,
      });
      setCompletion({ stars, trophy, streak, journey: journeyResult });
      setPhase("success");
      new Audio("/success.mp3").play().catch(() => {});
      if (trophy || journeyResult?.completed === journeyResult?.duration) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      }
    },
    [
      stopVerifier,
      words,
      journeySession,
      journeyState,
      journeyDay,
      mode,
      categoryName,
      current.affirmation,
    ],
  );

  const reset = useCallback(
    (nextIndex?: number) => {
      stopVerifier();
      if (nextIndex !== undefined) setIndex(nextIndex);
      attemptsRef.current = 0;
      setPhase("ready");
      setMatched(new Set());
      setTypedText("");
      setStatusNote(null);
      setCompletion(null);
    },
    [stopVerifier],
  );

  const nextAffirmation = useCallback(() => {
    let next = Math.floor(Math.random() * items.length);
    if (items.length > 1 && next === index) next = (next + 1) % items.length;
    reset(next);
  }, [items.length, index, reset]);

  const handleError = useCallback((error: SpeechVerifierError) => {
    setPhase("ready");
    if (error === "permission-denied") {
      setStatusNote("Microphone access was denied — you can type it instead.");
      setTyping(true);
    } else if (error === "no-speech") {
      setStatusNote("Didn't catch anything. Tap the mic and try again.");
    } else {
      setStatusNote("Speech recognition isn't supported here — type it instead.");
      setTyping(true);
    }
  }, []);

  const startListening = useCallback(() => {
    setMatched(new Set());
    setStatusNote(null);
    setPhase("listening");
    verifierRef.current ??= new WebSpeechVerifier();
    verifierRef.current.start(current.affirmation, {
      onWordMatched: (i) =>
        setMatched((prev) => (prev.has(i) ? prev : new Set(prev).add(i))),
      onResult: ({ matchScore }) => {
        attemptsRef.current += 1;
        if (matchScore >= MATCH_SCORE_THRESHOLD) {
          succeed(matchScore, "voice");
        } else {
          setPhase("retry");
        }
      },
      onError: handleError,
    });
  }, [current.affirmation, succeed, handleError]);

  const submitTyped = useCallback(() => {
    attemptsRef.current += 1;
    const score = similarityScore(current.affirmation, typedText);
    if (score >= MATCH_SCORE_THRESHOLD) {
      succeed(score, "typed");
    } else {
      setPhase("retry");
    }
  }, [current.affirmation, typedText, succeed]);

  // --- Journey pre-screens ---

  if (journeyLoading) {
    return (
      <Shell mode={mode} categoryName={categoryName}>
        <div className="min-h-64" aria-hidden />
      </Shell>
    );
  }

  if (showPicker) {
    return (
      <Shell mode={mode} categoryName={categoryName}>
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Make it a journey
          </p>
          <h1 className="font-display mt-4 max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            How long do you want to commit?
          </h1>
          <p className="mt-4 max-w-lg text-pretty text-muted-foreground">
            One affirmation a day, building from noticing the pattern to
            becoming someone new. Miss a day? Your progress waits for you —
            it never resets.
          </p>
          <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
            {JOURNEY_DURATIONS.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => {
                  setRawOverride(startJourney(mode, categoryName, duration));
                  setPickerOverride(false);
                  setFreeSession(false);
                  reset();
                }}
                className="group flex flex-col items-center rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-mode/50 hover:shadow-xl"
              >
                <span className="font-display text-4xl font-bold text-mode-2">
                  {duration}
                </span>
                <span className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  days
                </span>
                <span className="mt-3 font-medium">{DURATION_LABELS[duration]}</span>
                <JourneyDots total={duration} completed={0} className="mt-4" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFreeSession(true)}
            className="mt-8 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Skip for now — just practice freely
          </button>
        </div>
      </Shell>
    );
  }

  if ((journeyDoneToday || journeyComplete) && !freeSession && phase !== "success") {
    const state = journeyState as JourneyState;
    return (
      <Shell mode={mode} categoryName={categoryName}>
        <div className="flex flex-col items-center text-center">
          <JourneyDots total={state.duration} completed={state.completedDays.length} />
          <h1 className="font-display mt-6 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {journeyComplete
              ? `Journey complete — ${state.duration} days!`
              : `Day ${state.completedDays.length} of ${state.duration} done`}
          </h1>
          <p className="mt-3 max-w-md text-pretty text-muted-foreground">
            {journeyComplete
              ? "You practiced your way to a new default. That's not magic — that's reps."
              : "Today's rep is in the bank. Come back tomorrow to light the next dot."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {journeyComplete && (
              <button
                type="button"
                onClick={() => setPickerOverride(true)}
                className="rounded-full bg-mode px-7 py-3 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Start a new journey
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setFreeSession(true);
                reset();
              }}
              className={
                journeyComplete
                  ? "rounded-full border border-border bg-card/60 px-7 py-3 font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                  : "rounded-full bg-mode px-7 py-3 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              }
            >
              Practice freely anyway
            </button>
            <Link
              href={`/practice?mode=${mode}`}
              className="rounded-full border border-border bg-card/60 px-7 py-3 font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              All categories
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // --- Success ---

  if (phase === "success" && completion) {
    return (
      <Shell
        mode={mode}
        categoryName={categoryName}
        onNext={completion.journey ? undefined : nextAffirmation}
      >
        <div className="flex flex-col items-center text-center">
          {completion.trophy ? (
            <Image
              src="/mindset-engine-reward-trophy.png"
              alt="Trophy for completing three affirmations"
              width={160}
              height={160}
              className="size-32 sm:size-40"
            />
          ) : (
            <StarRow count={completion.stars} />
          )}
          <h1 className="font-display mt-6 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {completion.journey
              ? completion.journey.completed >= completion.journey.duration
                ? "Journey complete!"
                : `Day ${completion.journey.day} complete!`
              : completion.trophy
                ? "You did it!"
                : "Success!"}
          </h1>
          <p className="mt-3 max-w-md text-pretty text-lg text-muted-foreground">
            {current.successMessage}
          </p>
          {completion.journey && (
            <JourneyDots
              total={completion.journey.duration}
              completed={completion.journey.completed}
              className="mt-6"
            />
          )}
          <p className="mt-5 flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium">
            <Zap className="size-4 text-mode-2" fill="currentColor" aria-hidden />
            Day {completion.streak} streak
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {!completion.journey && (
              <button
                type="button"
                onClick={nextAffirmation}
                className="rounded-full bg-mode px-7 py-3 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Do another one
              </button>
            )}
            <Link
              href={`/practice?mode=${mode}`}
              className={
                completion.journey
                  ? "rounded-full bg-mode px-7 py-3 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
                  : "rounded-full border border-border bg-card/60 px-7 py-3 font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              }
            >
              All categories
            </Link>
            {completion.journey && (
              <button
                type="button"
                onClick={() => {
                  setFreeSession(true);
                  reset();
                }}
                className="rounded-full border border-border bg-card/60 px-7 py-3 font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                Keep practicing
              </button>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // --- Practice ---

  return (
    <Shell
      mode={mode}
      categoryName={categoryName}
      onNext={journeySession ? undefined : nextAffirmation}
    >
      <div className="flex flex-col items-center text-center">
        {journeySession && journeyState && journeyDay ? (
          <div className="flex flex-col items-center gap-3">
            <span className="rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm font-semibold">
              Day {journeyDay} of {journeyState.duration}
            </span>
            <JourneyDots
              total={journeyState.duration}
              completed={journeyState.completedDays.length}
            />
          </div>
        ) : (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Say this out loud
          </p>
        )}

        <p className="font-display mt-6 max-w-3xl text-balance text-3xl font-bold leading-snug tracking-tight sm:text-5xl sm:leading-snug">
          {words.map((word, i) => (
            // Space lives OUTSIDE the span: inline-block collapses its own
            // trailing whitespace, which glued the words together.
            <Fragment key={i}>
              <span className={`affirmation-word ${matched.has(i) ? "spoken" : ""}`}>
                {word}
              </span>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </p>

        {phase === "retry" && (
          <p className="mt-6 font-medium text-mode-2">
            That wasn&apos;t quite right — take a breath and try again.
          </p>
        )}
        {statusNote && phase !== "retry" && (
          <p className="mt-6 text-muted-foreground">{statusNote}</p>
        )}

        {!typing ? (
          <>
            <button
              type="button"
              onClick={phase === "listening" ? () => reset() : startListening}
              aria-label={phase === "listening" ? "Stop listening" : "Start speaking"}
              className={`mt-10 flex size-20 items-center justify-center rounded-full bg-mode text-mode-foreground shadow-xl transition-transform hover:scale-105 ${
                phase === "listening" ? "mic-listening" : ""
              }`}
            >
              {phase === "listening" ? (
                <MicOff className="size-8" aria-hidden />
              ) : (
                <Mic className="size-8" aria-hidden />
              )}
            </button>
            <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
              {phase === "listening"
                ? "Listening… speak the words above."
                : "Tap the mic, then say the words."}
            </p>
            {speechAvailable !== false && (
              <button
                type="button"
                onClick={() => setTyping(true)}
                className="mt-6 flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <Keyboard className="size-4" aria-hidden />
                Can&apos;t speak right now? Type it instead
              </button>
            )}
          </>
        ) : (
          <form
            className="mt-10 flex w-full max-w-xl flex-col items-center gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitTyped();
            }}
          >
            <textarea
              value={typedText}
              onChange={(event) => {
                setTypedText(event.target.value);
                setMatched(matchedWordIndices(words, event.target.value));
              }}
              rows={3}
              autoFocus
              placeholder="Type the affirmation word for word…"
              className="w-full resize-none rounded-2xl border border-border bg-card/70 px-5 py-4 text-base outline-none transition-colors focus:border-mode/60"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-mode px-7 py-3 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              >
                I said it
              </button>
              {speechAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    setTyping(false);
                    setTypedText("");
                    setMatched(new Set());
                  }}
                  className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                >
                  <Mic className="size-4" aria-hidden />
                  Use the mic
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </Shell>
  );
}
