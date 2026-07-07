# CLAUDE.md — Say This With Me

@AGENTS.md

Standing brief for Claude Code sessions. **Read `docs/PLAN.md` first** — it holds the vision, strategy, target architecture, and roadmap. This file covers the day-to-day facts. Heed AGENTS.md above: check `node_modules/next/dist/docs/` before using Next.js APIs — this Next version is newer than training data.

## What this is

Voice-activated affirmation app: the user speaks an affirmation out loud, speech recognition verifies the words with live word-by-word highlighting, and stars/streaks/trophies reward completion. Live at **saythiswith.me**.

## Stack & structure

Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind v4 · shadcn/ui · Zod. Deployed on Vercel (`vercel.json` pins the framework preset). `main` = production; pushing deploys.

| Path | Role |
|---|---|
| `src/app/` | Routes: `/` (modes + category cards), `/practice/[mode]/[category]` (speaking flow), `/science`, `/faq` |
| `src/components/app/` | App surface: home screen, practice screen, streak badge |
| `src/components/site/` | Chrome: header, footer, share button |
| `src/lib/speech/` | `SpeechVerifier` interface, `WebSpeechVerifier`, similarity scoring — the UI never touches the Web Speech API directly |
| `src/lib/` | `content.ts` (Zod-validated loader), `streak.ts`, `stars.ts` |
| `src/content/mindset-data.json` | All content: 4 modes → categories → affirmations |
| `legacy/` | Pre-rewrite static site, reference only — don't edit |

## Design system

Light + dark themes via next-themes (class attribute, default dark — the brand look). The logo renders via CSS mask (`.brand-logo`): white in dark mode, brand indigo→blue gradient in light mode. Per-mode theming via `data-mode` attribute + `--mode-accent`/`--mode-accent-2` tokens in `globals.css` (accent-2 has per-theme values — darker on light, lighter under `.dark`), consumed as Tailwind `mode`/`mode-2` colors. Type: **Bricolage Grotesque** (`font-display`) for headlines/affirmations, **Plus Jakarta Sans** body. Outline SVG illustrations per category live in `src/components/illustrations.tsx` (stroke = currentColor, theme/mode-tintable) — richer generated imagery may layer in later. Category cards are Mindvalley-style (gradient covers, rounded-3xl, grid) — **the user explicitly wants cards, never plain lists**. Live word highlighting (`.affirmation-word.spoken`) is the signature effect — polish it most. Everything must work desktop and mobile.

**Journeys (next big feature)**: 7/14/21-day commitment arcs per category — spec + owner decisions in `docs/roadmap/journeys.md`. Content-first: blocked on owner-approved progressive per-day affirmations. Never claim "21 days rewires the brain" — framing is "practice window" (honest-science brand rule).

### localStorage keys (legacy-compatible — don't rename)
- `mindsetEngineStarCount` — stars toward the 3-star trophy
- `mindsetEngineStreakCount` — daily streak
- `mindsetEngineLastPractice` — date of last completion (legacy `mindsetEngineLastVisit` read as fallback)

Streaks count **completed affirmations**, never page visits; `recordCompletion()` only runs on success.

## Running locally

```
npm run dev     # mic works on localhost (secure context)
npm run build   # includes typecheck — run before pushing
npm run lint
```

## Gotchas

- **Web Speech API**: Chrome-quality, flaky iOS Safari, absent Firefox — the typing fallback must stay first-class. Chrome sends audio to Google's servers; never claim on-device processing (see `/faq`).
- React Compiler lint is strict: no `Math.random`/impure calls in render (hoist to helpers), no setState-in-effect (use `useClientValue` in `src/hooks/` for browser-only reads).
- n8n email-capture webhook URL must not ship client-side — goes behind `/api/subscribe` (M4).
- GA4 events go through a `trackEvent()` helper when reintroduced (M4), never raw `gtag()`.

## Roadmap status

Phase 1 (rebuild): M0–M2 done — scaffold, home + design system, full practice flow (mic + typing fallback, stars/streak/win screen), `/science` + `/faq`. Remaining: session logging (M3), PWA + `/api/subscribe` + GA4 (M4), Playwright + CI (M5). Then Phase 2: Supabase accounts/data. Details: `docs/roadmap/phase-1-rebuild.md` and `docs/PLAN.md`.

## Conventions

- Specs in `docs/roadmap/`; update milestone checkboxes as work lands.
- Commit to `main` deploys production — build + lint must pass first.
