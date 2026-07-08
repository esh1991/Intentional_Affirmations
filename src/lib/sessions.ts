import type { ModeKey } from "@/lib/content";

/**
 * Client-only session log: an append-only record of completed affirmations in
 * localStorage, capped to the most recent entries. This is the seed of the
 * Phase 2 `sessions` table (the most valuable one) — uploaded when an
 * anonymous user creates an account. Spec: docs/roadmap/phase-1-rebuild.md.
 *
 * Affirmations have no IDs in the file-based content, so the affirmation text
 * is the identifier; the Postgres migration maps text → row.
 */

const SESSIONS_KEY = "mindsetEngineSessions";
const MAX_SESSIONS = 500;

export interface SessionEntry {
  affirmation: string;
  mode: ModeKey;
  category: string;
  /** 0–100 similarity score that cleared the threshold. */
  matchScore: number;
  /** Verification attempts on this affirmation, including the successful one. */
  attempts: number;
  input: "voice" | "typed";
  /** ISO 8601 timestamp. */
  completedAt: string;
  journeyDay?: number;
  journeyDuration?: number;
}

export function readSessions(): SessionEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as SessionEntry[]) : [];
  } catch {
    return [];
  }
}

/** Append a completed session. Logging must never break the win screen. */
export function recordSession(entry: SessionEntry): void {
  try {
    const sessions = readSessions();
    sessions.push(entry);
    localStorage.setItem(
      SESSIONS_KEY,
      JSON.stringify(sessions.slice(-MAX_SESSIONS)),
    );
  } catch {
    // localStorage full or unavailable — drop the entry silently.
  }
}
