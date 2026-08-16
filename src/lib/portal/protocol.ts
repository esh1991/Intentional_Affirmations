/**
 * Breaking protocol — the times they send something they shouldn't.
 *
 * The variable reward, in the premise's own terms. Slot machines and loot
 * boxes get their pull from unpredictability; the honest version of that is
 * unpredictable *warmth*, which costs nothing and manipulates no one.
 *
 * THREE RULES, all load-bearing:
 *
 * 1. **Still no outcomes.** Breaking protocol does not mean breaking decision
 *    10. Every line below is about the present, about memory, or about how
 *    they feel — never about how anything turns out. A message that leaked a
 *    prediction would undo the entire premise for a cheap thrill.
 * 2. **Deterministic, not random.** Chosen from a hash of the completion, so
 *    the same completion always yields the same result. That keeps it out of
 *    render as an impure call (the React Compiler lint forbids `Math.random`
 *    there) and means it cannot be re-rolled by refreshing.
 * 3. **Rare by default.** Roughly one completion in eight — often enough to be
 *    a real possibility, rare enough that it lands. At Clearance 4, which is
 *    literally called "Off protocol", it becomes common.
 *
 * Pre-written rather than generated: an LLM call on the win screen would add
 * cost and latency to the single most important moment in the app, to produce
 * something a human can write better.
 */

const OFF_PROTOCOL: string[] = [
  "They'll flag this. I remember this exact week — I remember thinking nobody could tell.",
  "Off the record: I'm proud of you. That is not on the list of things I'm cleared to send.",
  "I'll get in trouble for this. You are further along today than you think you are.",
  "Not cleared, don't care — the version of you reading this is the one I like best.",
  "Between us: I spent that whole stretch worrying about the wrong thing.",
  "They'll cut this from the transcript. I still think about this day.",
  "Against the rules, but: you don't have to feel like doing it. You just did it.",
  "This one's not sanctioned. I know exactly how tired you are right now.",
];

/** Stable 32-bit hash. Same input, same output, forever. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** One in this many completions carries an off-protocol message. */
const ODDS_BASE = 8;
const ODDS_OFF_PROTOCOL_CLEARANCE = 3;

/**
 * The message for a given completion, or null for the ordinary case.
 *
 * `seed` should be something unique and stable per completion — the
 * affirmation plus its timestamp. Passing a value that changes between renders
 * would make the message flicker in and out.
 */
export function offProtocolFor(
  seed: string,
  clearanceLevel: number,
): string | null {
  const odds = clearanceLevel >= 4 ? ODDS_OFF_PROTOCOL_CLEARANCE : ODDS_BASE;
  const h = hash(seed);
  if (h % odds !== 0) return null;
  return OFF_PROTOCOL[Math.floor(h / odds) % OFF_PROTOCOL.length];
}
