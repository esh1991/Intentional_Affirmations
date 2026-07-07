# CLAUDE.md — Say This With Me

@AGENTS.md

Standing brief for Claude Code sessions. **Read `docs/PLAN.md` first** — it holds the vision, strategy, target architecture, and roadmap. This file covers the day-to-day facts.

> **You are on the `rebuild/next` branch** — the Phase 1 Next.js rebuild. Spec: `docs/roadmap/phase-1-rebuild.md`. The old static site is parked in `legacy/` for reference during the port (it still serves production from `main`); don't edit it here. Heed AGENTS.md above: check `node_modules/next/dist/docs/` before using Next.js APIs.

## What this is

Voice-activated affirmation app: the user speaks an affirmation out loud, the Web Speech API verifies the words with live word-by-word highlighting, and stars/streaks/trophies reward completion. Live at **saythiswith.me**.

## Current stack (pre-rewrite)

Static vanilla HTML/CSS/JS, no build step, no backend, no accounts.

| File | Role |
|---|---|
| `index.html` | The app: 4 mode tabs, category screen, affirmation screen, win screen |
| `app.js` | All logic: data loading, speech recognition, streaks/stars, GA4 events, email capture |
| `mindset-data.json` | All content — 4 modes (`powerUp`, `breakIt`, `primeMe`, `rewire`) → categories → affirmations |
| `style.css` | App styles (per-mode themes via `body.theme-*` classes) |
| `resources.html` / `faq.html` / `resources-style.css` | Marketing/info pages |

External services: GA4 (`gtag`), n8n webhook for email capture (URL hardcoded in `app.js`), canvas-confetti from CDN.

### localStorage keys
- `mindsetEngineStarCount` — stars toward the 3-star trophy
- `mindsetEngineStreakCount` — daily streak count
- `mindsetEngineLastPractice` — date of last completed affirmation (legacy key `mindsetEngineLastVisit` is read as a fallback for existing users — don't remove that fallback)

## Running locally

```
npm run dev        # Next.js app (this branch)
npx serve legacy   # old static site, for reference
```

Microphone requires a secure context — `localhost` qualifies; a LAN IP does not.

## Gotchas

- **Web Speech API**: solid in Chrome, flaky on iOS Safari, absent in Firefox. Chrome sends audio to Google's servers for recognition — never claim speech is processed locally (see `faq.html` privacy answer; keep it honest).
- **Streaks count completed affirmations, not visits.** `updateStreak()` must only run from `handleSuccess()`, never on page load.
- The current codebase is scheduled for a full rewrite in Phase 1 (Next.js + TS + Tailwind, see PLAN.md). Keep changes to the vanilla site surgical — fix bugs, don't refactor.
- Deployment is Vercel (static preset), serving saythiswith.me. Pushing to `main` deploys the live site — treat `main` as production; PRs get preview deployments.

## Roadmap status

- **Phase 0 — Foundations**: ✅ done (repo in `C:\dev`, Vercel + domain live, live-site bugs fixed, this file + PLAN.md added).
- **Phase 1 — Rebuild**: next up. Next.js 15 + TS + Tailwind + shadcn/ui, speech behind a `SpeechVerifier` interface, PWA, mobile-first.
- Phases 2–4: Supabase accounts/data → growth engine → monetization. Details in PLAN.md.

## Conventions

- Specs for larger pieces of work go in `docs/roadmap/`.
- Workflow: GitHub issue → branch → PR → preview deploy → merge. No direct-to-`main` pushes once Vercel previews exist.
- GA4 events go through the `trackEvent()` helper, never raw `gtag()`.
