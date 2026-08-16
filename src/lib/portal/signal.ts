/**
 * Signal strength — how clear the channel is right now.
 *
 * The diegetic replacement for a streak counter resetting to zero. Miss days
 * and the transmission degrades: more grain, more drift, the portrait less
 * resolved. Come back and it clears.
 *
 * Why this shape rather than a number:
 *
 * - **It is fully reversible.** One completed line restores it, from any state.
 *   "Streak: 0" is a punishment that also destroys the record of what you did;
 *   a noisy signal is an invitation that costs you nothing permanent.
 * - **It never blocks anything.** Degradation is atmosphere and one line of
 *   copy. Nothing is withheld, no practice is gated, no progress is lost — the
 *   dots stay advance-only, as they always have been.
 * - **It is honest about what it measures.** Days since you last said a line.
 *   Not engagement, not app opens.
 *
 * Deliberately *not* modelled on loss mechanics that punish: this is a
 * mental-health-adjacent product, and someone returning after two weeks away
 * should meet something that reads as "good, you're back", not a scoreboard of
 * their absence.
 */

export type SignalState = "clear" | "drifting" | "faint" | "lost";

export interface Signal {
  state: SignalState;
  /** Whole days since the last completed line. 0 = today. */
  daysAway: number;
  /** 0 (pristine) → 1 (heaviest). Drives the visual grade. */
  noise: number;
  /** Shown on the daily call. Never scolds, never counts absence back at them. */
  note: string | null;
}

const CLEAR: Signal = {
  state: "clear",
  daysAway: 0,
  noise: 0,
  note: null,
};

/** Whole days between a `toDateString()` value and today. */
export function daysSince(lastPractice: string | null): number | null {
  if (!lastPractice) return null;
  const last = new Date(lastPractice);
  if (Number.isNaN(last.getTime())) return null;
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = startOf(new Date()) - startOf(last);
  return Math.max(0, Math.round(diff / 86_400_000));
}

/**
 * Signal for someone whose last line was `lastPractice`.
 *
 * A first-time visitor (null) reads as clear, not lost — they haven't drifted
 * from anything, and greeting someone's first ever visit with a degraded
 * channel would be nonsense.
 */
export function signalFor(lastPractice: string | null): Signal {
  const daysAway = daysSince(lastPractice);
  if (daysAway === null) return CLEAR;
  if (daysAway <= 1) return { ...CLEAR, daysAway };
  if (daysAway <= 3) {
    return {
      state: "drifting",
      daysAway,
      noise: 0.35,
      note: "The signal has drifted a little. Today's line will clear it.",
    };
  }
  if (daysAway <= 6) {
    return {
      state: "faint",
      daysAway,
      noise: 0.6,
      note: "They're faint from here. Say today's line and they come back in.",
    };
  }
  return {
    state: "lost",
    daysAway,
    noise: 0.85,
    note: "It's been a while. They're still on the line — say one and it clears.",
  };
}
