import type { ModeKey } from "@/lib/content";

/**
 * Journey state: 7/14/21-day commitment arcs per category. Client-only
 * (localStorage) in Phase 1; moves to Supabase in Phase 2. Decisions and
 * content rules: docs/roadmap/journeys.md.
 *
 * Dots are advance-only: a missed day never resets progress, it just doesn't
 * advance. Day N's content comes from the category's 21-entry arc, sampled
 * per duration so every length ends on identity-level statements.
 */

export type JourneyDuration = 7 | 14 | 21;

export const JOURNEY_DURATIONS: JourneyDuration[] = [7, 14, 21];

export interface JourneyState {
  duration: JourneyDuration;
  startedAt: string;
  completedDays: string[]; // toDateString() values, max one per local day
}

export type JourneyMap = Record<string, JourneyState>;

const KEY = "mindsetEngineJourneys";

/** 1-based days of the 21-entry arc used for each duration. */
const DAY_SAMPLES: Record<JourneyDuration, number[]> = {
  7: [1, 4, 7, 10, 14, 18, 21],
  14: [1, 2, 3, 5, 7, 8, 9, 11, 13, 15, 17, 19, 20, 21],
  21: Array.from({ length: 21 }, (_, i) => i + 1),
};

export function journeyKey(mode: ModeKey, categoryName: string): string {
  return `${mode}/${categoryName}`;
}

/** Raw storage read; feed through parseJourneys. Client-only. */
export function readJourneysRaw(): string {
  return localStorage.getItem(KEY) ?? "";
}

export function parseJourneys(raw: string | null): JourneyMap {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as JourneyMap;
  } catch {
    return {};
  }
}

export function todayString(): string {
  return new Date().toDateString();
}

export function isCompletedToday(state: JourneyState): boolean {
  return state.completedDays.includes(todayString());
}

export function isFinished(state: JourneyState): boolean {
  return state.completedDays.length >= state.duration;
}

/** The day (1-based) whose affirmation should be practiced next. */
export function nextDay(state: JourneyState): number {
  return Math.min(state.completedDays.length + 1, state.duration);
}

/** Index into the category's 21-entry arc for a given journey day. */
export function arcIndexForDay(duration: JourneyDuration, day: number): number {
  return DAY_SAMPLES[duration][day - 1] - 1;
}

function save(map: JourneyMap): string {
  const raw = JSON.stringify(map);
  localStorage.setItem(KEY, raw);
  return raw;
}

/** Overwrite local journeys (cloud merge write-back). Returns the raw value. */
export function restoreJourneys(map: JourneyMap): string {
  return save(map);
}

/** Starts (or restarts) a journey. Returns the new raw storage value. */
export function startJourney(
  mode: ModeKey,
  categoryName: string,
  duration: JourneyDuration,
): string {
  const map = parseJourneys(localStorage.getItem(KEY));
  map[journeyKey(mode, categoryName)] = {
    duration,
    startedAt: todayString(),
    completedDays: [],
  };
  return save(map);
}

/** Marks today's day complete (idempotent). Returns the new raw value. */
export function completeJourneyDay(mode: ModeKey, categoryName: string): string {
  const map = parseJourneys(localStorage.getItem(KEY));
  const state = map[journeyKey(mode, categoryName)];
  if (state && !isCompletedToday(state) && !isFinished(state)) {
    state.completedDays.push(todayString());
    return save(map);
  }
  return localStorage.getItem(KEY) ?? "";
}
