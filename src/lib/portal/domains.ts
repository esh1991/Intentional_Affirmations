import type { ModeKey } from "@/lib/content";

/**
 * Life domains — the axis the portal tunes on, replacing the four practice
 * modes as the user-facing taxonomy.
 *
 * These reuse the existing `data-mode` attribute rather than a new
 * `data-domain` one: `--mode-accent` / `--mode-accent-2` already drive every
 * fill, glow, cover, dot, star and the word highlight, so swapping the value
 * set costs zero component changes. Token values live in globals.css.
 *
 * `bridgeMode` is the honest part of the current state: generated arcs arrive
 * in M4, so until then a tuned domain hands off to the closest existing
 * owner-approved mode. It is a pointer, not a permanent mapping.
 */

export const DOMAIN_KEYS = [
  "body",
  "craft",
  "wealth",
  "calm",
  "connection",
] as const;

export type DomainKey = (typeof DOMAIN_KEYS)[number];

export interface Domain {
  key: DomainKey;
  /** Shown on the tuning card. */
  label: string;
  /** How the user names the life, in their own voice. */
  prompt: string;
  /** Placeholder for the goal field — concrete, never aspirational mush. */
  example: string;
  bridgeMode: ModeKey;
}

export const DOMAINS: Record<DomainKey, Domain> = {
  body: {
    key: "body",
    label: "My body",
    prompt: "The version of me who takes care of this body",
    example: "trains before work without negotiating with myself",
    bridgeMode: "powerUp",
  },
  craft: {
    key: "craft",
    label: "My work",
    prompt: "The version of me who did the work",
    example: "finished the thing I keep talking about",
    bridgeMode: "powerUp",
  },
  wealth: {
    key: "wealth",
    label: "My money",
    prompt: "The version of me who got it under control",
    example: "stopped avoiding the number and paid it down",
    bridgeMode: "rewire",
  },
  calm: {
    key: "calm",
    label: "My head",
    prompt: "The version of me who is not at war with themselves",
    example: "sleeps without replaying the day",
    bridgeMode: "breakIt",
  },
  connection: {
    key: "connection",
    label: "My people",
    prompt: "The version of me who showed up for them",
    example: "is present with my kids instead of half-there",
    bridgeMode: "primeMe",
  },
};

export const DOMAIN_LIST: Domain[] = DOMAIN_KEYS.map((k) => DOMAINS[k]);

export function isDomainKey(value: string): value is DomainKey {
  return (DOMAIN_KEYS as readonly string[]).includes(value);
}

/** How far ahead the guide is calling from. */
export const HORIZONS = [
  { key: "6m", label: "Six months" },
  { key: "1y", label: "A year" },
  { key: "3y", label: "Three years" },
] as const;

export type HorizonKey = (typeof HORIZONS)[number]["key"];

export function horizonLabel(key: HorizonKey): string {
  return HORIZONS.find((h) => h.key === key)?.label ?? "A year";
}

/** Spoken form for the guide's byline: "You, a year from now". */
export function horizonPhrase(key: HorizonKey): string {
  return `${horizonLabel(key).toLowerCase()} from now`;
}

/* ------------------------------------------------------------------ *
 * Coordinates — what the user tells us before we go looking.
 * Client-only for now: tuning is free, so it stays anonymous. Sign-in is
 * required later, only for the portrait, which is the step that costs money.
 * ------------------------------------------------------------------ */

const KEY = "mindsetEnginePortal";

export interface Coordinates {
  domain: DomainKey;
  goal: string;
  horizon: HorizonKey;
  /** toDateString() of when the line was first opened. */
  tunedAt: string;
}

/**
 * Raw storage read — feed through parseCoordinates.
 *
 * Returns a string, never an object: useClientValue is built on
 * useSyncExternalStore, whose snapshot must be referentially stable. Returning
 * a freshly-built object each call makes React re-render forever. Returning ""
 * for "absent" also keeps null meaning exactly one thing — still hydrating.
 */
export function readCoordinatesRaw(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function parseCoordinates(raw: string | null): Coordinates | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Coordinates>;
    if (!parsed.domain || !isDomainKey(parsed.domain)) return null;
    return {
      domain: parsed.domain,
      goal: typeof parsed.goal === "string" ? parsed.goal : "",
      horizon: (parsed.horizon ?? "1y") as HorizonKey,
      tunedAt: parsed.tunedAt ?? new Date().toDateString(),
    };
  } catch {
    return null;
  }
}

/** Convenience for non-render callers (event handlers, effects). */
export function readCoordinates(): Coordinates | null {
  return parseCoordinates(readCoordinatesRaw());
}

export function saveCoordinates(next: Omit<Coordinates, "tunedAt">): Coordinates {
  const value: Coordinates = { ...next, tunedAt: new Date().toDateString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Private mode — the session still works, it just will not be remembered.
  }
  return value;
}

export function clearCoordinates(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
