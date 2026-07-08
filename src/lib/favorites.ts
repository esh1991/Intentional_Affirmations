import type { ModeKey } from "@/lib/content";

/**
 * Favorites, client-side. New in Phase 2 (the legacy heart never persisted).
 * localStorage for everyone; synced to the `favorites` table when signed in
 * (src/lib/sync.ts). Keyed by affirmation text — same natural key as sessions.
 */

const KEY = "mindsetEngineFavorites";

export interface Favorite {
  affirmation: string;
  mode: ModeKey;
  category: string;
  addedAt: string;
}

export function readFavorites(): Favorite[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as Favorite[]) : [];
  } catch {
    return [];
  }
}

export function isFavorite(affirmation: string): boolean {
  return readFavorites().some((f) => f.affirmation === affirmation);
}

/** Toggle; returns true if the affirmation is now favorited. */
export function toggleFavorite(
  affirmation: string,
  mode: ModeKey,
  category: string,
): boolean {
  const favorites = readFavorites();
  const index = favorites.findIndex((f) => f.affirmation === affirmation);
  let nowFavorited: boolean;
  if (index >= 0) {
    favorites.splice(index, 1);
    nowFavorited = false;
  } else {
    favorites.push({ affirmation, mode, category, addedAt: new Date().toISOString() });
    nowFavorited = true;
  }
  localStorage.setItem(KEY, JSON.stringify(favorites));
  return nowFavorited;
}

/** Overwrite local favorites (cloud merge write-back). */
export function restoreFavorites(favorites: Favorite[]): void {
  localStorage.setItem(KEY, JSON.stringify(favorites));
}
