/**
 * Keyword-overlap similarity, ported from the legacy app's checkSimilarity().
 * Deliberately forgiving: stop words don't count, punctuation is ignored.
 * Revisit with real session data (fuzzy matching for accents is an open
 * question in the phase-1 spec).
 */

const STOP_WORDS = new Set([
  "i", "a", "an", "the", "is", "am", "are", "will", "to", "and", "my", "of",
  "for", "this",
]);

export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z]/g, "");
}

function normalizedWords(text: string): string[] {
  return text.split(/\s+/).map(normalizeWord).filter(Boolean);
}

/** 0–100: share of the target's keywords present in the spoken/typed text. */
export function similarityScore(target: string, spoken: string): number {
  const keywords = normalizedWords(target).filter((w) => !STOP_WORDS.has(w));
  if (keywords.length === 0) return 0;
  const spokenSet = new Set(normalizedWords(spoken));
  const matched = keywords.filter((w) => spokenSet.has(w)).length;
  return (matched / keywords.length) * 100;
}

/** Indices of `targetWords` (pre-split display words) present in `text`. */
export function matchedWordIndices(targetWords: string[], text: string): Set<number> {
  const spokenSet = new Set(normalizedWords(text));
  const matched = new Set<number>();
  targetWords.forEach((word, i) => {
    const normalized = normalizeWord(word);
    if (normalized && spokenSet.has(normalized)) matched.add(i);
  });
  return matched;
}
