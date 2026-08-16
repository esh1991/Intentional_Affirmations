# CLAUDE.md — Say This With Me

@AGENTS.md

Standing brief for Claude Code sessions. **Read `docs/PLAN.md` first** — it holds the vision, strategy, target architecture, and roadmap. This file covers the day-to-day facts. Heed AGENTS.md above: check `node_modules/next/dist/docs/` before using Next.js APIs — this Next version is newer than training data.

## What this is

**A portal to your future self.** You name the life you're reaching for; a version of you who already got there reaches back — but they are not permitted to tell you what happens, only what to do next. They send one line a day, you read it back out loud, and speech recognition verifies every word with live highlighting. Live at **saythiswith.me**.

The restriction is the product, not set dressing: it keeps the app honest (we cannot know anyone's future) and makes it structurally incapable of serving the vivid-fantasy-without-action failure mode (Oettingen). Full premise, decisions and lineage: `docs/roadmap/phase-3-portal.md`.

## Stack & structure

Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind v4 · shadcn/ui · Zod. Deployed on Vercel (`vercel.json` pins the framework preset). `main` = production; pushing deploys.

| Path | Role |
|---|---|
| `src/app/` | Routes: `/` (marketing home), `/portal` (tune → contact → portrait → conversation → the line), `/pact` (the daily call), `/science`, `/faq`, `/signin`, `/account`, `/legal/*`, `/api/portal/*`, `/api/subscribe`, `/api/account/delete` |
| `src/components/app/` | `speak-the-line.tsx` — the mic, typing fallback and word highlighting, owned by `/pact`. Journey dots, streak badge. |
| `src/components/portal/` | Portal flow, consent + photo upload, the conversation panel |
| `src/components/pact/` | The daily call |
| `src/lib/portal/` | `domains.ts` (5 life domains + coordinates), `guide.ts`, `arc.ts` (Claude arc generation), `portrait.ts` (fal), `conversation.ts`, `jobs.ts` (quota), `blob.ts` (private portrait storage) |
| `src/components/home/` | Marketing home: self-playing hero demo, welcome-back banner, email signup |
| `src/components/site/` | Chrome: header, footer, share button |
| `src/lib/speech/` | `SpeechVerifier` interface, `WebSpeechVerifier`, similarity scoring — the UI never touches the Web Speech API directly |
| `src/lib/` | `content.ts` (Zod-validated loader), `streak.ts`, `stars.ts`, `sessions.ts`, `favorites.ts`, `sync.ts` (cloud merge/dual-write), `supabase/client.ts` (schema-pinned; `platformDb()` for the shared schema), `auth/google.ts` (GSI ID-token sign-in), `legal.ts`, `analytics.ts` (`trackEvent()` → GA4 + PostHog) |
| `src/content/mindset-data.json` | All content: 4 modes → categories → affirmations |
| `legacy/` | Pre-rewrite static site, reference only — don't edit |

## Design system

Light + dark themes via next-themes (class attribute, default dark — the brand look). The logo renders via CSS mask (`.brand-logo`): white in dark mode, brand indigo→blue gradient in light mode. Per-mode theming via `data-mode` attribute + `--mode-accent`/`--mode-accent-2` tokens in `globals.css` (accent-2 has per-theme values — darker on light, lighter under `.dark`), consumed as Tailwind `mode`/`mode-2` colors. Type: **Bricolage Grotesque** (`font-display`) for headlines/affirmations, **Plus Jakarta Sans** body. Outline SVG illustrations per category live in `src/components/illustrations.tsx` (stroke = currentColor, theme/mode-tintable) — richer generated imagery may layer in later. Category cards are Mindvalley-style (gradient covers, rounded-3xl, grid) — **the user explicitly wants cards, never plain lists**. Live word highlighting (`.affirmation-word.spoken`) is the signature effect — polish it most. Everything must work desktop and mobile.

**Journeys**: 7/21-day commitment arcs — spec, decisions, and open items in `docs/roadmap/journeys.md`. State in localStorage (`mindsetEngineJourneys`), logic in `src/lib/journeys.ts`, progressive 21-entry arcs in `mindset-data.json` (Zod-enforced). Journey content is owner-approved — don't rewrite arcs without approval. Never claim "21 days rewires the brain" — framing is "practice window" (honest-science brand rule).

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

## Phase 3 — the portal (complete 2026-08-15)

`/practice`, the 4 modes and the 13-category browse hub are **retired**. `mindset-data.json`
survives doing two jobs: the few-shot style contract for arc generation, and the fallback arc a
signed-out visitor practises. It is not a browse source any more.

- **Generation is authenticated, quota'd and server-side.** Portraits on fal, arcs and the
  conversation on `claude-opus-5`. Quota is checked *before* any provider call, and fails closed.
- **Photo policy:** the source selfie is never stored anywhere by us — it lives in the request
  and the call to fal. Portraits are **private** blobs, read through an ownership-checked route
  that streams them (an `<img>` cannot carry an auth header, so the client fetches with the
  bearer token and uses an object URL).
- **Honest science is enforced in the arc prompt** — no neuroplasticity, no manifestation,
  actions never outcomes. The M5 cutover found the *hand-written* `/science` page and the root
  site metadata breaking exactly those rules; both were rewritten. Check marketing copy against
  the rule, not just model output.
- Deliberate deviation: the conversation requires sign-in, though the plan said anonymous. An
  unauthenticated LLM endpoint is an open money faucet and there is no anon identity to meter.

## Roadmap status (as of 2026-07-08)

**Phase 1 (rebuild) complete 2026-07-08**; **Phase 2 (accounts) core complete 2026-07-10** — Supabase auth (Google + email codes, no login wall ever), client-side-only auth (no SSR auth plumbing, decision log in `docs/roadmap/phase-2-accounts.md`), user data tables with owner-only RLS (`supabase/migrations/`), two-way sync/merge (`src/lib/sync.ts` — localStorage stays the UI's source of truth), favorites heart, `/account` with delete-account cascade, PostHog env-gated (key still owed by owner). Backlog: favorites list view, ToS/privacy, real SMTP before traffic. Next: Phase 3 growth engine (`docs/PLAN.md`).

Owner working style: ships straight to `main` (zero users, tests in production), wants discussion + approval before big features and before content changes, gives design direction by reference (Duolingo/Mindvalley) and reacts fast to what's live.

## Conventions

- Specs in `docs/roadmap/`; update milestone checkboxes as work lands.
- Commit to `main` deploys production — build + lint must pass first.
