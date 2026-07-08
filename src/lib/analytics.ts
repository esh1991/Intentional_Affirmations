import { sendGAEvent } from "@next/third-parties/google";

/**
 * GA4 lives behind this helper — components never call gtag() directly
 * (CLAUDE.md rule). Event names carry over from the legacy site so reporting
 * history stays continuous: tab_switched, category_selected,
 * affirmation_success, email_signup.
 */

export const GA_MEASUREMENT_ID = "G-8GYK2VZBW9";

export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>,
): void {
  try {
    sendGAEvent("event", eventName, eventParams ?? {});
  } catch {
    // Analytics must never break the app (blocked scripts, SSR, etc.).
  }
}
