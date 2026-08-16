"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Mic, MicOff } from "lucide-react";
import {
  MATCH_SCORE_THRESHOLD,
  type SpeechVerifierError,
} from "@/lib/speech/SpeechVerifier";
import {
  WebSpeechVerifier,
  isSpeechRecognitionAvailable,
} from "@/lib/speech/web-speech-verifier";
import { matchedWordIndices, similarityScore } from "@/lib/speech/similarity";
import { playClick } from "@/lib/sound";
import { playChordResolve, playWordNote } from "@/lib/audio";
import { useClientValue } from "@/hooks/use-client-value";

/**
 * The speaking core: one line, said out loud, verified word by word.
 *
 * Extracted from PracticeScreen so `/practice` and `/pact` share one
 * implementation of the mechanic that is the whole product. It owns the mic,
 * the typing fallback and the highlighting — and deliberately owns **nothing**
 * about what success means. Stars, streaks, journeys and session logging stay
 * with the caller, because the two surfaces reward completion differently.
 *
 * The typing fallback is first-class, not a courtesy: the Web Speech API is
 * Chrome-quality, flaky on iOS Safari and absent in Firefox.
 *
 * ⚠️ Callers MUST pass `key={affirmation}`. Resetting this component's state
 * from an effect when the line changes is what the React Compiler lint forbids
 * (and it is the wrong pattern anyway) — remounting on the key is how a new
 * line starts clean, otherwise the previous line's highlighting bleeds into
 * the next one.
 */

export interface SpeakResult {
  matchScore: number;
  input: "voice" | "typed";
  attempts: number;
}

export function SpeakTheLine({
  affirmation,
  onSuccess,
  header,
  belowLine,
  /** Plays the rising word-chord as each word lands. Off inside /practice, which has its own sound design. */
  chord = false,
}: {
  affirmation: string;
  onSuccess: (result: SpeakResult) => void;
  header?: React.ReactNode;
  belowLine?: React.ReactNode;
  chord?: boolean;
}) {
  const [phase, setPhase] = useState<"ready" | "listening" | "retry">("ready");
  const [typing, setTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [matched, setMatched] = useState<ReadonlySet<number>>(new Set());
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const words = affirmation.split(" ");
  const speechAvailable = useClientValue(isSpeechRecognitionAvailable);
  const verifierRef = useRef<WebSpeechVerifier | null>(null);
  // Verification attempts on this line (voice results + typed submissions).
  const attemptsRef = useRef(0);

  const stopVerifier = useCallback(() => {
    verifierRef.current?.stop();
  }, []);

  // Release the mic if the user navigates away mid-listen.
  useEffect(() => stopVerifier, [stopVerifier]);

  const finish = useCallback(
    (matchScore: number, input: "voice" | "typed") => {
      stopVerifier();
      setMatched(new Set(words.map((_, i) => i)));
      if (chord) playChordResolve();
      onSuccess({ matchScore, input, attempts: attemptsRef.current });
    },
    [stopVerifier, words, onSuccess, chord],
  );

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
    playClick();
    setMatched(new Set());
    setStatusNote(null);
    setPhase("listening");
    verifierRef.current ??= new WebSpeechVerifier();
    verifierRef.current.start(affirmation, {
      onWordMatched: (i) =>
        setMatched((prev) => {
          if (prev.has(i)) return prev;
          if (chord) playWordNote(prev.size);
          return new Set(prev).add(i);
        }),
      onResult: ({ matchScore }) => {
        attemptsRef.current += 1;
        if (matchScore >= MATCH_SCORE_THRESHOLD) finish(matchScore, "voice");
        else setPhase("retry");
      },
      onError: handleError,
    });
  }, [affirmation, finish, handleError, chord]);

  const submitTyped = useCallback(() => {
    attemptsRef.current += 1;
    const score = similarityScore(affirmation, typedText);
    if (score >= MATCH_SCORE_THRESHOLD) finish(score, "typed");
    else setPhase("retry");
  }, [affirmation, typedText, finish]);

  const stopListening = useCallback(() => {
    stopVerifier();
    setPhase("ready");
    setMatched(new Set());
  }, [stopVerifier]);

  return (
    <div className="flex flex-col items-center text-center">
      {header}

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

      {belowLine}

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
            onClick={phase === "listening" ? stopListening : startListening}
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
  );
}
