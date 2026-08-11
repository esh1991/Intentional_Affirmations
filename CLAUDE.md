# CLAUDE.md — Say This With Me

@AGENTS.md

Standing brief for Claude Code sessions. **Read `docs/PLAN.md` first** — it holds the vision, strategy, target architecture, and roadmap. This file covers the day-to-day facts. Heed AGENTS.md above: check `node_modules/next/dist/docs/` before using Next.js APIs — this Next version is newer than training data.

## What this is

Voice-activated affirmation app: the user speaks an affirmation out loud, speech recognition verifies the words with live word-by-word highlighting, and stars/streaks/trophies reward completion. Live at **saythiswith.me**.

## Stack & structure

Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind v4 · shadcn/ui · Zod. Deployed on Vercel (`vercel.json` pins the framework preset). `main` = production; pushing deploys.

| Path | Role |
|---|---|
| `src/app/` | Routes: `/` (marketing home), `/practice` (modes + category cards hub), `/practice/[mode]/[category]` (speaking flow), `/science`, `/faq`, `/signin`, `/account`, `/legal/privacy`, `/legal/terms`, `/api/subscribe`, `/api/account/delete` |
| `src/components/app/` | App surface: home screen (the /practice hub), practice screen, streak badge |
| `src/components/home/` | Marketing home: self-playing hero demo, welcome-back banner, email signup |
| `src/components/site/` | Chrome: header, footer, share button |
| `src/lib/speech/` | `SpeechVerifier` interface, `WebSpeechVerifier`, similarity scoring — the UI never touches the Web Speech API directly |
| `src/lib/` | `content.ts` (Zod-validated loader), `streak.ts`, `stars.ts`, `sessions.ts`, `favorites.ts`, `sync.ts` (cloud merge/dual-write), `supabase/client.ts` (schema-pinned; `platformDb()` for the shared schema), `auth/google.ts` (GSI ID-token sign-in), `legal.ts`, `analytics.ts` (`trackEvent()` → GA4 + PostHog) |
| `src/content/mindset-data.json` | All content: 4 modes → categories → affirmations |
| `legacy/` | Pre-rewrite static site, reference only — don't edit |

## Design system

Light + dark themes via next-themes (class attribute, default dark — the brand look). The logo renders via CSS mask (`.brand-logo`): white in dark mode, brand indigo→blue gradient in light mode. Per-mode theming via `data-mode` attribute + `--mode-accent`/`--mode-accent-2` tokens in `globals.css` (accent-2 has per-theme values — darker on light, lighter under `.dark`), consumed as Tailwind `mode`/`mode-2` colors. Type: **Bricolage Grotesque** (`font-display`) for headlines/affirmations, **Plus Jakarta Sans** body. Outline SVG illustrations per category live in `src/components/illustrations.tsx` (stroke = currentColor, theme/mode-tintable) — richer generated imagery may layer in later. Category cards are Mindvalley-style (gradient covers, rounded-3xl, grid) — **the user explicitly wants cards, never plain lists**. Live word highlighting (`.affirmation-word.spoken`) is the signature effect — polish it most. Everything must work desktop and mobile.

**Journeys (live on all 13 categories)**: 7/14/21-day commitment arcs — spec, decisions, and open items in `docs/roadmap/journeys.md`. State in localStorage (`mindsetEngineJourneys`), logic in `src/lib/journeys.ts`, progressive 21-entry arcs in `mindset-data.json` (Zod-enforced). Journey content is owner-approved — don't rewrite arcs without approval. Never claim "21 days rewires the brain" — framing is "practice window" (honest-science brand rule).

### localStorage keys (legacy-compatible — don't rename)
- `mindsetEngineStarCount` — stars toward the 3-star trophy
- `mindsetEngineStreakCount` — daily streak
- `mindsetEngineLastPractice` — date of last completion (legacy `mindsetEngineLastVisit` read as fallback)
- `mindsetEngineSessions` — append-only completion log (last 500), the Phase 2 `sessions` table seed

Streaks count **completed affirmations**, never page visits; `recordCompletion()` only runs on success.

## Running locally

```
npm run dev       # mic works on localhost (secure context)
npm run build     # includes typecheck — run before pushing
npm run lint
npm run test:e2e  # Playwright smoke test — run build first (starts `npm start`, doesn't build)
```

## Gotchas

- **The Supabase project is SHARED with First 100** (`c:\dev\Buffer_Alt`) since 2026-08-11 — one `auth.users` pool, our tables in the `saythiswith` schema, profiles in `platform`. **Read `docs/shared-backend.md` before touching auth, schemas or anything Supabase.** Three things that will bite: the client is schema-pinned so `.from("sessions")` means `saythiswith.sessions`; `platformDb()` is how you reach `platform.profiles` (keyed `user_id`, not `id`); and `/api/subscribe` talks to PostgREST by hand so it needs the `Content-Profile: saythiswith` header, which nothing else does.
- **Sign-in is Google-only, via `signInWithIdToken` — not `signInWithOAuth`.** The redirect flow can only use the one Google client on the Supabase project, so switching back would make both apps show the *same* consent screen. There is no email/magic-link path: one project has one email template and one sender, so branded auth email for two apps isn't possible without a Send Email Hook and our own mail provider. Don't half-add email sign-in.
- **Web Speech API**: Chrome-quality, flaky iOS Safari, absent Firefox — the typing fallback must stay first-class. Chrome sends audio to Google's servers; never claim on-device processing (see `/faq`).
- **`npm run test:e2e` silently lies if anything else is on port 3000.** `playwright.config.ts` sets `reuseExistingServer: true`, so it runs the suite against whatever is already listening — during the 2026-08-11 session it "failed" while actually testing a different app entirely. Check the port before believing a result.
- React Compiler lint is strict: no `Math.random`/impure calls in render (hoist to helpers), no setState-in-effect (use `useClientValue` in `src/hooks/` for browser-only reads).
- Email capture writes to the Supabase `subscribers` table via `/api/subscribe` (n8n retired). `SUPABASE_SECRET_KEY` is server-only — never client-side or `NEXT_PUBLIC_`. Setup: `docs/supabase.md`.
- GA4 (`G-8GYK2VZBW9`, prod-only) loads via `@next/third-parties` in the root layout; events go through `trackEvent()` in `src/lib/analytics.ts`, never raw `gtag()`. Legacy event names kept: `tab_switched`, `category_selected`, `affirmation_success`, `email_signup`.

## Backend consolidation (2026-08-11)

Moved onto First 100's Supabase project (`rxwyuqcsifohiiyvyink`) so both apps share one user
pool, while each keeps its own Google consent screen via the ID-token flow. Our seven tables
moved from `public` to the `saythiswith` schema; `profiles` moved to the shared `platform`
schema. The old project `ykdiptjrfpxpuvbcufej` is **paused, not deleted** — keep it until at
least mid-September 2026; its export is at `c:\dev\.migration\stwm-export.json`.

Migrated faithfully, though there was nothing of substance: one user
(`intentionalaffirmations@gmail.com`, id preserved), one subscriber (`test@gmail.com`), zero
sessions. Verified end to end — signing in with one Google account on both apps yields one
`user_id`, and a practice completion wrote through to `saythiswith.sessions` under RLS.

Details, invariants and the things that will break it: `docs/shared-backend.md`.

## Roadmap status (as of 2026-07-08)

**Phase 1 (rebuild) complete 2026-07-08**; **Phase 2 (accounts) core complete 2026-07-10** — Supabase auth (Google + email codes, no login wall ever), client-side-only auth (no SSR auth plumbing, decision log in `docs/roadmap/phase-2-accounts.md`), user data tables with owner-only RLS (`supabase/migrations/`), two-way sync/merge (`src/lib/sync.ts` — localStorage stays the UI's source of truth), favorites heart, `/account` with delete-account cascade, PostHog env-gated (key still owed by owner). Backlog: favorites list view, ToS/privacy, real SMTP before traffic. Next: Phase 3 growth engine (`docs/PLAN.md`).

Owner working style: ships straight to `main` (zero users, tests in production), wants discussion + approval before big features and before content changes, gives design direction by reference (Duolingo/Mindvalley) and reacts fast to what's live.

## Conventions

- Specs in `docs/roadmap/`; update milestone checkboxes as work lands.
- Commit to `main` deploys production — build + lint must pass first.
