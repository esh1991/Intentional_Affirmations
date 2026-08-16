/**
 * Clearance — what they're permitted to send you.
 *
 * The progression system, expressed in the premise's own terms: trust accrues,
 * so the channel widens. It is deliberately NOT points. A number going up is a
 * score; being cleared for more is a relationship changing, and it costs the
 * same to build.
 *
 * Two rules keep it honest:
 *
 * 1. **Every level must change what actually happens.** A level that only
 *    prints a nicer word is the bolted-on gamification this design exists to
 *    avoid. Each one below alters the conversation's turn allowance or what the
 *    guide can see.
 * 2. **No level ever reveals an outcome.** Clearance deepens guidance; it never
 *    lifts the restriction (decision 10). There is nothing to falsely promise,
 *    because they still cannot tell you how it turns out.
 *
 * Measured in **distinct days practised**, not lines said. Showing up on eight
 * separate days is the thing being rewarded; saying eight lines in one sitting
 * is not the same and shouldn't count as if it were.
 */

export interface ClearanceLevel {
  level: 1 | 2 | 3 | 4;
  /** Distinct practice days required to reach it. */
  days: number;
  name: string;
  /** What the user is told they've unlocked. Present tense, their words. */
  unlocked: string;
  /** Turns the guide will take in one call. */
  turns: number;
  /** Whether the guide can see what you've been saying. */
  remembers: boolean;
}

export const CLEARANCE: ClearanceLevel[] = [
  {
    level: 1,
    days: 0,
    name: "Contact",
    unlocked: "One line a day, and they'll answer a few questions.",
    turns: 3,
    remembers: false,
  },
  {
    level: 2,
    days: 3,
    name: "Open channel",
    unlocked: "The channel holds longer now — they'll stay for more questions.",
    turns: 5,
    remembers: false,
  },
  {
    level: 3,
    days: 7,
    name: "They remember",
    unlocked:
      "They can see what you've been saying, and they'll refer back to it.",
    turns: 8,
    remembers: true,
  },
  {
    level: 4,
    days: 21,
    name: "Off protocol",
    unlocked:
      "They've stopped being careful with you. Longer calls, and they say more than they should.",
    turns: 12,
    remembers: true,
  },
];

/** The level earned by this many distinct practice days. */
export function clearanceFor(days: number): ClearanceLevel {
  let earned = CLEARANCE[0];
  for (const level of CLEARANCE) if (days >= level.days) earned = level;
  return earned;
}

/** The next level up, or null at the top. */
export function nextClearance(days: number): ClearanceLevel | null {
  return CLEARANCE.find((l) => l.days > days) ?? null;
}

/** Distinct local days represented in a list of ISO completion timestamps. */
export function distinctDays(completedAt: string[]): number {
  const days = new Set<string>();
  for (const iso of completedAt) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) days.add(d.toDateString());
  }
  return days.size;
}
