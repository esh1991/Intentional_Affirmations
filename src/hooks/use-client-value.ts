"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Read a browser-only value (localStorage, window.location, …) in a way
 * that's SSR/hydration-safe: returns null on the server and during
 * hydration, then the real value on the client — no setState-in-effect.
 * The snapshot must return a primitive (or cached object) for stability.
 */
export function useClientValue<T>(getSnapshot: () => T): T | null {
  return useSyncExternalStore(noopSubscribe, getSnapshot, () => null);
}
