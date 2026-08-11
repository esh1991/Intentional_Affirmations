/**
 * Constants the legal pages read, so a policy can never describe a
 * configuration the app isn't actually running. Mirrors the pattern in
 * First 100's lib/brand.ts.
 *
 * These pages exist because Google's OAuth consent screen requires live
 * privacy-policy and terms URLs before an app can be published (2026-08-11).
 * They are deliberately plain — accurate beats impressive.
 */

export const LEGAL_OPERATOR = "Say This With Me";
export const LEGAL_LOCATION = "Chicago, Illinois, United States";
export const LEGAL_UPDATED = "11 August 2026";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.saythiswith.me";

// The address in the site footer. Replace when support@saythiswith.me exists —
// and change it here only, since both legal pages read it from this constant.
export const CONTACT_EMAIL = "intentionalaffirmations@gmail.com";

// GA4 is unconditional (prod-only via the layout); PostHog is env-gated, so the
// privacy policy must not claim it's running when the key is absent.
export const POSTHOG_ENABLED = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
