/**
 * Star/trophy progress: every completed affirmation earns a star; the third
 * star becomes a trophy and the count resets. Client-only. The key is
 * unchanged from the legacy site (see CLAUDE.md) so progress carries over.
 */

const STAR_KEY = "mindsetEngineStarCount";

export function readStars(): number {
  return parseInt(localStorage.getItem(STAR_KEY) ?? "0", 10) || 0;
}

/** Overwrite local stars (cloud merge write-back). */
export function restoreStars(count: number): void {
  localStorage.setItem(STAR_KEY, String(count));
}

export function addStar(): { stars: number; trophy: boolean } {
  const stars = readStars() + 1;
  if (stars >= 3) {
    localStorage.setItem(STAR_KEY, "0");
    return { stars: 3, trophy: true };
  }
  localStorage.setItem(STAR_KEY, String(stars));
  return { stars, trophy: false };
}
