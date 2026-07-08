# Phase 2 — Accounts & data (Supabase)

*Spec written 2026-07-08. Parent plan: [`docs/PLAN.md`](../PLAN.md). Supabase project + `subscribers` table already live from Phase 1 email capture (`docs/supabase.md`).*

## Decisions (owner-approved 2026-07-08)

- **Auth**: Google OAuth + passwordless email codes (OTP). No passwords. Apple deferred until a native app forces it ($99/yr).
- **Content stays file-based** — deviation from the original PLAN.md scope, approved: the Zod-validated JSON in git is the admin pipeline while the owner is the only editor. Content tables + admin page move to Phase 3 (programmatic SEO / AI content need them; accounts don't).
- **PostHog added alongside GA4** (retention D1/D7/D30 is the whole game); rides the same `trackEvent()` helper, identity stitched on login.
- **Client-side auth only** for v1: supabase-js in the browser, no `@supabase/ssr`/cookies/proxy. The app surface is already a client component tree and no route server-renders user data. Revisit only if SEO'd personalized pages appear. All user-data access relies on RLS with the user's JWT — the publishable key is safe client-side by design.
- **No login wall** (from PLAN.md, unchanged): anonymous users keep the full core experience on localStorage; signing in adds sync + backup. "Sign up to keep your streak" is an offer, never a gate.

## Milestones

- [x] **P2-M0 — Auth foundation** (2026-07-08): `@supabase/supabase-js`, env-driven client (auth UI hidden when env vars absent), `/signin` (Google button + email code flow), header session state (sign in ↔ avatar menu with sign out), `profiles` table + signup trigger (migration `supabase/migrations/0002_profiles.sql`). Ships before owner actions 1–3 land — auth simply activates as they do.
- [ ] **P2-M1 — User data + merge**: `sessions`, `streaks`, `journeys`, `stars` tables (RLS owner-only). On first sign-in: one-time upload/merge of localStorage state (sessions appended, streak = max, journey days unioned, stars = max). While signed in: writes go to localStorage *and* Supabase (localStorage stays the offline/anon truth).
- [ ] **P2-M2 — Favorites**: reintroduced from legacy — heart on the practice screen; localStorage for anon, table + merge for accounts.
- [ ] **P2-M3 — PostHog**: `posthog-js` behind `trackEvent()` fan-out (GA4 + PostHog), pageviews, `identify()` on login, retention dashboards. Needs owner to create the PostHog project + provide the key.
- [ ] **P2-M4 — Account page**: `/account` — display name, signed-in email, sign out, delete account (server route with the secret key removes auth user + data). ToS/privacy links land here too.

## Resume state (session paused 2026-07-08)

**P2-M1 + M2 + M3 code is written and committed locally but NOT pushed** (push = production deploy; it builds + lints but hasn't been verified end-to-end because the migrations aren't applied yet). What exists on this commit:

- `supabase/migrations/0003_user_data.sql` — sessions/streaks/stars/journeys/favorites tables + profiles insert policy. **Not yet run by owner.**
- `src/lib/sync.ts` — two-way merge (`syncNow`, run by `SyncManager` in the layout on sign-in), per-completion dual-write (`syncCompletion`, wired into the practice screen), `syncFavorite`.
- `src/lib/favorites.ts` + heart button on the practice screen ("Save this one"); `restore*` write-back helpers added to streak/stars/journeys libs.
- PostHog in `src/lib/analytics.ts` (env-gated on `NEXT_PUBLIC_POSTHOG_KEY`, inert until set) + `AnalyticsProvider` pageviews + identify/reset via `SyncManager`.

**Next session**: (1) owner runs 0002 + 0003 in the SQL editor; (2) verify sync e2e — create a test user via the auth admin API with the secret key (no email needed), sign in with password grant, exercise RLS writes/merge; (3) then push, and continue with P2-M4 (account page + delete-account route — not yet started). Owner also still owes the Vercel `NEXT_PUBLIC_*` env vars (auth is invisible in prod until then) and deferred the Google OAuth provider setup mid-flow (email codes work).

## Owner actions (as they come due)

1. **Now (P2-M0)**: add to Vercel env vars — `NEXT_PUBLIC_SUPABASE_URL` (same value as `SUPABASE_URL`) and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the `sb_publishable_...` key). Run `supabase/migrations/0002_profiles.sql` in the SQL editor.
2. **Now (P2-M0)**: Supabase Dashboard → Authentication → URL Configuration: Site URL `https://www.saythiswith.me`, add `http://localhost:3000` to Redirect URLs.
3. **For Google sign-in**: create a Google Cloud OAuth client (Supabase Dashboard → Authentication → Providers → Google shows the exact callback URL to paste) and enter its client ID + secret in that provider screen. Until then the Google button errors politely; email codes work out of the box.
4. **Email note**: Supabase's built-in SMTP is rate-limited (~2 auth emails/hour) — fine for testing; swap in a real SMTP provider (Resend) before real traffic.
5. **P2-M3**: create a PostHog project, provide `NEXT_PUBLIC_POSTHOG_KEY` (+ host region).

## Non-goals

- Content in Postgres, admin page (Phase 3)
- Stripe/premium (Phase 4)
- Native wrapper, Apple sign-in
- Server-side rendering of user data
