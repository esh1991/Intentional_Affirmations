/**
 * Client-only streak state. Keys are unchanged from the legacy static site so
 * existing visitors keep their streaks/stars across the rebuild cutover —
 * don't rename them (see CLAUDE.md). Dates are stored as toDateString()
 * strings in the user's local timezone, matching the legacy format.
 */

const STREAK_KEY = "mindsetEngineStreakCount";
const LAST_PRACTICE_KEY = "mindsetEngineLastPractice";
const LEGACY_LAST_VISIT_KEY = "mindsetEngineLastVisit";

function lastPracticeDate(): string | null {
  return (
    localStorage.getItem(LAST_PRACTICE_KEY) ??
    localStorage.getItem(LEGACY_LAST_VISIT_KEY)
  );
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toDateString();
}

/**
 * Current streak for display. If the last completed affirmation was before
 * yesterday, the streak is over: reset stored state and return 0 rather than
 * showing a stale count.
 */
export function readStreak(): number {
  const stored = parseInt(localStorage.getItem(STREAK_KEY) ?? "0", 10) || 0;
  const last = lastPracticeDate();
  const broken =
    stored !== 0 && last !== new Date().toDateString() && last !== yesterdayString();
  if (broken) {
    localStorage.setItem(STREAK_KEY, "0");
    return 0;
  }
  return stored;
}

/** Last practice day as stored (toDateString format), for cloud sync. */
export function readLastPractice(): string | null {
  return lastPracticeDate();
}

/** Overwrite local streak state (cloud merge write-back). */
export function restoreStreak(count: number, lastPractice: string | null): void {
  localStorage.setItem(STREAK_KEY, String(count));
  if (lastPractice) localStorage.setItem(LAST_PRACTICE_KEY, lastPractice);
}

/**
 * Call on affirmation completion (never on page load — the streak rewards the
 * action). Increments at most once per local day. Returns the new streak.
 */
export function recordCompletion(): number {
  const today = new Date().toDateString();
  let streak = readStreak();
  if (lastPracticeDate() !== today) {
    streak = streak + 1;
    localStorage.setItem(LAST_PRACTICE_KEY, today);
    localStorage.setItem(STREAK_KEY, String(streak));
  }
  return streak;
}
