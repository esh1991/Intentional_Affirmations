import { sendGAEvent } from "@next/third-parties/google";
import posthog from "posthog-js";

/**
 * All analytics live behind this helper — components never call gtag() or
 * posthog directly (CLAUDE.md rule). Events fan out to GA4 (continuity with
 * the legacy site) and PostHog (retention/funnels, Phase 2). PostHog is
 * env-gated: without NEXT_PUBLIC_POSTHOG_KEY it never initializes.
 *
 * Legacy event names kept: tab_switched, category_selected,
 * affirmation_success, email_signup.
 */

export const GA_MEASUREMENT_ID = "G-8GYK2VZBW9";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let posthogReady = false;

/** Idempotent; called from the layout's AnalyticsProvider on mount. */
export function initAnalytics(): void {
  if (posthogReady || !POSTHOG_KEY || typeof window === "undefined") return;
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // SPA navigation: pageviews are captured manually in AnalyticsProvider.
      capture_pageview: false,
      persistence: "localStorage+cookie",
    });
    posthogReady = true;
  } catch {
    // Analytics must never break the app.
  }
}

export function trackPageview(path: string): void {
  if (!posthogReady) return;
  try {
    posthog.capture("$pageview", { $current_url: window.location.origin + path });
  } catch {}
}

export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>,
): void {
  try {
    sendGAEvent("event", eventName, eventParams ?? {});
  } catch {}
  if (posthogReady) {
    try {
      posthog.capture(eventName, eventParams);
    } catch {}
  }
}

/** Stitch anonymous history to the account on sign-in. */
export function identifyUser(id: string, email?: string): void {
  if (!posthogReady) return;
  try {
    posthog.identify(id, email ? { email } : undefined);
  } catch {}
}

/** Called on sign-out so the next visitor isn't attributed to the account. */
export function resetIdentity(): void {
  if (!posthogReady) return;
  try {
    posthog.reset();
  } catch {}
}
