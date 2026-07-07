/**
 * All affirmation verification goes through this interface — the UI must never
 * touch webkitSpeechRecognition (or any other engine) directly. This is what
 * lets us swap Web Speech for on-device Whisper, server-side recognition, or
 * an AR/VR input source later without touching the app.
 *
 * Implementations (fallback order):
 *  1. WebSpeechVerifier — Web Speech API (Chrome-quality, flaky iOS, no Firefox)
 *  2. TypedVerifier     — text input fallback; also what Playwright drives in CI
 *
 * Spec: docs/roadmap/phase-1-rebuild.md
 */

export type SpeechVerifierError =
  | "permission-denied" // mic access refused
  | "no-speech" // engine heard nothing
  | "unavailable"; // engine not supported in this browser

export interface SpeechVerifierResult {
  /** 0–100. The flow treats >= 65 as success (ported similarity heuristic). */
  matchScore: number;
  /** What the engine heard (or the user typed). Logged to the session record. */
  transcript: string;
}

export interface SpeechVerifierCallbacks {
  /**
   * A word of the target phrase was recognized; index into the target's
   * word array. Drives the live word-highlighting effect (the signature UI).
   * May fire out of order and more than once per word.
   */
  onWordMatched(wordIndex: number): void;
  /** Terminal: the engine produced a final result. Verifier has stopped. */
  onResult(result: SpeechVerifierResult): void;
  /** Terminal: the attempt failed before producing a result. Verifier has stopped. */
  onError(error: SpeechVerifierError): void;
}

export interface SpeechVerifier {
  /** False when this engine can't run in the current browser. */
  readonly available: boolean;
  /**
   * Begin verifying one attempt at `target`. Exactly one of onResult/onError
   * fires per start(), unless stop() cancels the attempt first.
   */
  start(target: string, callbacks: SpeechVerifierCallbacks): void;
  /** Cancel the current attempt; no further callbacks fire. Safe when idle. */
  stop(): void;
}

/** The success threshold for SpeechVerifierResult.matchScore. */
export const MATCH_SCORE_THRESHOLD = 65;
