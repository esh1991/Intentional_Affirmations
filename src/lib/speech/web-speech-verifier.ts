import type {
  SpeechVerifier,
  SpeechVerifierCallbacks,
} from "@/lib/speech/SpeechVerifier";
import { matchedWordIndices, similarityScore } from "@/lib/speech/similarity";

/**
 * Web Speech API implementation. Chrome-quality, flaky on iOS Safari, absent
 * in Firefox — the UI must offer the typing fallback when unavailable.
 * Note: in Chrome the browser sends audio to Google's servers for recognition
 * (never claim on-device processing; see faq).
 */

/* Minimal local typing for the (non-standard) Web Speech API. */
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  isFinal: boolean;
  0: RecognitionAlternative;
}
interface RecognitionEvent {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResult };
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function isSpeechRecognitionAvailable(): boolean {
  return getRecognitionCtor() !== undefined;
}

export class WebSpeechVerifier implements SpeechVerifier {
  private recognition: Recognition | null = null;

  get available(): boolean {
    return isSpeechRecognitionAvailable();
  }

  start(target: string, callbacks: SpeechVerifierCallbacks): void {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      callbacks.onError("unavailable");
      return;
    }
    this.stop();

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const targetWords = target.split(/\s+/);
    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalTranscript += result[0].transcript + " ";
        else interim += result[0].transcript + " ";
      }
      for (const index of matchedWordIndices(targetWords, finalTranscript + interim)) {
        callbacks.onWordMatched(index);
      }
      if (finalTranscript) {
        this.stop();
        callbacks.onResult({
          matchScore: similarityScore(target, finalTranscript),
          transcript: finalTranscript.trim(),
        });
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        this.stop();
        callbacks.onError("permission-denied");
      } else if (event.error === "no-speech") {
        this.stop();
        callbacks.onError("no-speech");
      }
      // Other errors (e.g. transient network) are left to the no-speech
      // timeout behavior of the engine rather than hard-failing the attempt.
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      // start() throws if already started — safe to ignore
    }
  }

  stop(): void {
    const recognition = this.recognition;
    if (!recognition) return;
    this.recognition = null;
    recognition.onresult = null;
    recognition.onerror = null;
    try {
      recognition.abort();
    } catch {
      // aborting an idle recognition is a no-op
    }
  }
}
