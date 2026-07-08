# Phase 1 — Rebuild (Next.js)

*Spec written 2026-07-07. Parent plan: [`docs/PLAN.md`](../PLAN.md). Work happens on the `rebuild/next` branch; `main` keeps serving the current static site until cutover.*

## Goal

Rebuild the existing 4-mode affirmation experience as a mobile-first Next.js PWA with a new design system, with speech recognition behind a swappable `SpeechVerifier` interface **including a typing fallback**. Content stays file-based. No accounts, no backend (that's Phase 2).

## Non-goals

- Supabase, auth, server-side anything (Phase 2)
- New content, journeys, premium features
- Native wrapper
- Blog/SEO pages beyond porting the existing resources/FAQ content

## Stack

- Next.js 15+ (App Router), TypeScript **strict**, Tailwind CSS, shadcn/ui
- PWA: web manifest + service worker (`@serwist/next` or equivalent)
- Playwright for the core-flow smoke test
- GA4 kept as-is for continuity (PostHog arrives Phase 2)

## Architecture

### Routes

| Route | Replaces |
|---|---|
| `/` | `index.html` — mode tabs, categories, affirmation flow, win screen |
| `/science` | `resources.html` |
| `/faq` | `faq.html` |

Marketing pages are server components; the app surface is a client component tree.

### SpeechVerifier interface

The AR/VR and Whisper insurance policy. All recognition goes through this; the UI never touches `webkitSpeechRecognition` directly.

```ts
interface SpeechVerifier {
  readonly available: boolean;
  start(target: string, callbacks: {
    onWordMatched(wordIndex: number): void;   // drives live highlighting
    onResult(result: { matchScore: number; transcript: string }): void;
    onError(error: SpeechVerifierError): void; // 'permission-denied' | 'no-speech' | 'unavailable'
  }): void;
  stop(): void;
}
```

Implementations, in fallback order:
1. `WebSpeechVerifier` — wraps Web Speech API; ports the existing stop-word similarity scoring (≥65% = success)
2. `TypedVerifier` — text input; user types (or copies by reading) the affirmation. Ships in Phase 1 — this is the Firefox/iOS-flakiness/accessibility answer, not a nice-to-have.

Selection: try Web Speech; on `unavailable` or repeated `no-speech`/errors, offer the typing fallback inline ("Can't use your mic? Type it instead").

### Content

`mindset-data.json` moves to `src/content/` with a Zod schema + types generated from it. Same shape (4 modes → categories → items) so Phase 2's Postgres migration is a straight mapping.

### Client state (localStorage)

**Keep the exact same keys** so existing users keep streaks/stars at cutover:
`mindsetEngineStarCount`, `mindsetEngineStreakCount`, `mindsetEngineLastPractice` (legacy `mindsetEngineLastVisit` read-fallback), plus new: `mindsetEngineSessions` — append-only log of completions `{ affirmationId, mode, category, matchScore, attempts, completedAt }`, capped (e.g. last 500). This is the Phase 2 `sessions` table seed: uploaded on anon→account merge.

Streak rules as on `main`: increments only on completion, once per local day; broken streak displays 0 on load.

### Design

Per PLAN.md: calm-premium, mobile-first, dark mode, 4-mode theming via CSS custom properties consumed by Tailwind. The affirmation display is the hero — display typography, and the word-highlight effect gets the most polish. Restrained motion elsewhere.

### Email capture

~~Move the n8n webhook call behind `/api/subscribe`, same n8n destination.~~ **Superseded (owner decision, 2026-07-08): n8n retired.** `/api/subscribe` writes to a Supabase `subscribers` table with the server-only secret key — the first Phase 2 pull-forward. One capture point: the marketing home. Setup: `docs/supabase.md`.

## Testing / guardrails

- TS strict, ESLint, CI on PRs (typecheck + lint + build + Playwright)
- Playwright smoke test of the core flow using `TypedVerifier` (deterministic — no mic in CI): pick mode → category → complete affirmation → win screen → streak increments

## Deployment & cutover

1. Second Vercel project (framework preset: Next.js) pointed at `rebuild/next` on a `*.vercel.app` URL — test on real phones throughout.
2. Cutover when the smoke test passes and the phone experience beats the old site: merge to `main`, switch the production Vercel project's preset to Next.js (or repoint the domain at the new project), delete `legacy/`.
3. Rollback = revert the merge; the static site is fully preserved in git.

## Milestones

- [x] M0: Branch + scaffold (Next.js, TS strict, Tailwind, shadcn/ui), old site parked in `legacy/`, `SpeechVerifier` interface committed
- [x] M1: Content schema + home screen (modes/categories) with new design system; FAQ ported; legacy `.html` URL redirects; `vercel.json` pins the Next.js framework preset
- [x] M2: Affirmation flow with `WebSpeechVerifier` + live highlighting; typing fallback (implemented as a UI path over the shared similarity module rather than a `TypedVerifier` class — same scoring, keyboard-drivable in CI); stars/streaks/win screen. Also: dark brand design system (white logo on deep indigo-black, Mindvalley-style category cards, desktop-grade layouts), `/science` port with share buttons
- [x] M2.5 (owner-driven additions, 2026-07-07/08):
  - Light + dark themes via next-themes (dark default); CSS-masked logo (white ↔ brand gradient)
  - Typography: Bricolage Grotesque display + Plus Jakarta Sans body
  - 16 custom outline SVG illustrations (per-category card art, science steps/concepts)
  - **Journeys live on all 13 categories** — see `journeys.md` for spec, decisions, and status
  - Fixed affirmation word-spacing bug (space was inside the inline-block word span)
- [x] M3: session logging to localStorage (`mindsetEngineSessions`) — append-only, capped at 500; entries log affirmation text (content has no IDs — Phase 2 maps text → row), mode, category, matchScore, attempts, input (voice/typed), completedAt, and journey day/duration when applicable
- [x] M4a (2026-07-08, owner-approved structure): **site split** — marketing home at `/` (self-playing word-highlight hero demo, how-it-works with Choose/Speak/LockIn art, 4-mode use-case cards, science strip, email capture, welcome-back streak banner) and the app hub moved to `/practice` (`/?mode=` redirects follow it). **GA4 restored** via `@next/third-parties`, prod-only, same property `G-8GYK2VZBW9`, legacy event names, all calls through `trackEvent()`. **Email capture** → `/api/subscribe` → Supabase `subscribers` (n8n retired; owner must create the project + set `SUPABASE_URL`/`SUPABASE_SECRET_KEY` in Vercel — `docs/supabase.md`; endpoint 503s gracefully until then). **Brand favicon/icon set** (bubble mark on gradient tile: `icon.svg`, `apple-icon.png`, `public/icon-192/512.png` — the PWA icons).
- [x] M4b (2026-07-08): PWA — `app/manifest.ts` (installed app opens `/practice`, dark brand theme color) + minimal `public/sw.js` (caches only small static assets, never HTML — deploys can't be masked by a stale cache; Serwist skipped, needs webpack and we're on Turbopack). Click sounds on mode tabs, category cards, mic start, journey picker (legacy `click.mp3` via `playClick()` in `src/lib/sound.ts`)
- [ ] M5: Playwright smoke test (drive the typing path; cover journey picker → day 1 → dots) + CI; phone QA

## Resume notes for a fresh session (2026-07-08)

- `main` = production; every push deploys via Vercel. Build + lint must pass before pushing (`npm run build; npm run lint`).
- Owner workflow so far: ships straight to main (zero users), tests in production, wants discussion/approval **before** big product features and content (journeys content was approved via a sample arc first).
- Next up by plan: M3 (session logging) → M4 → M5, then Phase 2 (Supabase). Owner may reprioritize — ask.
- Open polish item: day-7/14/21 arc entries say "One week in…" etc., which is slightly off for 7/14-day journeys that sample those days early; owner said acceptable for now, duration-neutral variants are the fix if it comes up.

## Open questions

- Fuzzy matching for accents (PLAN.md accessibility note): keep the 65% stop-word heuristic for M2, revisit with real data.
- Streak repair/freeze mechanic: decided in Phase 2 when streaks go server-side.
