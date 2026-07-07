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

Move the n8n webhook call behind a Next.js route handler (`/api/subscribe`) so the webhook URL is no longer public client-side. Same n8n destination for now.

## Testing / guardrails

- TS strict, ESLint, CI on PRs (typecheck + lint + build + Playwright)
- Playwright smoke test of the core flow using `TypedVerifier` (deterministic — no mic in CI): pick mode → category → complete affirmation → win screen → streak increments

## Deployment & cutover

1. Second Vercel project (framework preset: Next.js) pointed at `rebuild/next` on a `*.vercel.app` URL — test on real phones throughout.
2. Cutover when the smoke test passes and the phone experience beats the old site: merge to `main`, switch the production Vercel project's preset to Next.js (or repoint the domain at the new project), delete `legacy/`.
3. Rollback = revert the merge; the static site is fully preserved in git.

## Milestones

- [x] M0: Branch + scaffold (Next.js, TS strict, Tailwind, shadcn/ui), old site parked in `legacy/`, `SpeechVerifier` interface committed
- [ ] M1: Content schema + home screen (modes/categories) with new design system
- [ ] M2: Affirmation flow with `WebSpeechVerifier` + live highlighting
- [ ] M3: `TypedVerifier` + fallback UX; stars/streaks/win screen; session logging
- [ ] M4: PWA, `/science` + `/faq` ports, `/api/subscribe`, GA4 events
- [ ] M5: Playwright smoke test + CI; phone QA; cutover

## Open questions

- Fuzzy matching for accents (PLAN.md accessibility note): keep the 65% stop-word heuristic for M2, revisit with real data.
- Streak repair/freeze mechanic: decided in Phase 2 when streaks go server-side.
