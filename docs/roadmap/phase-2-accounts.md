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
- [x] **P2-M1 — User data + merge** (2026-07-10): `sessions`/`streaks`/`stars`/`journeys`/`favorites` tables (migration 0003, RLS owner-only — verified: anon denied, cross-user inserts rejected). `src/lib/sync.ts`: two-way merge on sign-in via `SyncManager` (streak = freshest/max, stars = max, journey days = union, favorites = union; session log uploaded once per user/device), dual-write per completion. localStorage stays the UI's source of truth.
- [x] **P2-M2 — Favorites** (2026-07-10): heart on the practice screen ("Save this one"), `mindsetEngineFavorites` locally, synced + merged for accounts. No list view yet — backlog.
- [x] **P2-M3 — PostHog** (2026-07-10): behind `trackEvent()` fan-out, SPA pageviews, identify/reset on sign-in/out. **Inert until the owner creates a PostHog project and sets `NEXT_PUBLIC_POSTHOG_KEY` (+ optional `NEXT_PUBLIC_POSTHOG_HOST`).**
- [x] **P2-M4 — Account page** (2026-07-10): `/account` — email, display name (profiles upsert), sign out, two-step delete account via `/api/account/delete` (token-verified, admin delete, FK cascade — verified e2e with a test user). ToS/privacy pages still to come (backlog).

## Status (2026-07-10)

**Phase 2 core is complete, live, and verified — including Google sign-in confirmed working by the owner on production (publishable key confirmed inlined in the prod bundle).** Migrations 0001–0003 applied. E2E verified with a throwaway user: password sign-in, profile trigger, all RLS write/read paths, anon + cross-user denial, account deletion with full cascade. Remaining backlog: favorites list view, ToS/privacy pages, PostHog key (owner), swap Supabase built-in SMTP for a real provider before real traffic.

## Owner actions

1. ~~Vercel `NEXT_PUBLIC_*` env vars + migrations 0002/0003~~ ✅ done 2026-07-10
2. ~~Auth URL configuration~~ ✅ done 2026-07-10
3. ~~Google Cloud OAuth client + Supabase provider config~~ ✅ done 2026-07-10 — **owner confirmed Google sign-in works on production**
4. **Still open — before real traffic**: swap Supabase's built-in SMTP (~2 auth emails/hour) for a real provider (Resend); rotate the secret key that was pasted into chat on 2026-07-08 (update Vercel + `.env.local`).
5. **Still open — when retention dashboards are wanted**: create a PostHog project and set `NEXT_PUBLIC_POSTHOG_KEY` (+ optional `NEXT_PUBLIC_POSTHOG_HOST`) — the integration is live but dormant without it.

## Non-goals

- Content in Postgres, admin page (Phase 3)
- Stripe/premium (Phase 4)
- Native wrapper, Apple sign-in
- Server-side rendering of user data
