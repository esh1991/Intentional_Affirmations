/** UI click sound (legacy click.mp3). Sound must never break an interaction. */
export function playClick(): void {
  try {
    const audio = new Audio("/click.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {
    // Audio unavailable (SSR, autoplay policy) — stay silent.
  }
}
