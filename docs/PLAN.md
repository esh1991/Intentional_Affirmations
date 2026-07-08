# Say This With Me — Master Plan
*Written 2026-07-07 with Claude Code. Keep this file at `docs/PLAN.md` in the repo. New Claude sessions should read this first.*

## Vision
Voice-activated mindset engine: users speak affirmations out loud, the app verifies the exact words via speech recognition with live on-screen feedback, and gamification (stars, streaks, trophies) rewards the action. Thesis: change requires action, not consumption. Long-term: Mindvalley-style journeys, voice-energy feedback, eventually AR/VR embodied practice. Goal: 100k active users.

## Current state (updated 2026-07-08 — read CLAUDE.md for day-to-day facts)
**The rebuild is live in production.** Next.js 16 (App Router) + TS strict + Tailwind v4 + shadcn/ui on Vercel at saythiswith.me; `main` = production, every push deploys. The old static site is parked in `legacy/` for reference only.

Shipped and live:
- Full practice flow behind the `SpeechVerifier` interface: mic verification with live word highlighting, typing fallback (auto-offered when mic unavailable/denied), stars/trophy/confetti, completion-based streaks (legacy localStorage keys preserved).
- **Journeys** (pulled forward from Phase 3): 7/14/21-day commitment arcs on **all 13 categories**, owner-approved progressive content (Notice→Act→Become), advance-only progress dots. See `docs/roadmap/journeys.md`.
- Brand design system: light/dark themes (dark default), CSS-masked logo (white in dark, brand gradient in light), Bricolage Grotesque + Plus Jakarta Sans, Mindvalley-style category cards with custom outline SVG illustrations, desktop + mobile layouts.
- `/science` and `/faq` pages (honest speech-privacy wording), legacy `.html` URL redirects.

### Phase 0 bug list — all resolved 2026-07-07
Favorite-button ReferenceError (fixed, then superseded by the rebuild), dead `affirmations.json` (deleted), FAQ privacy claim (reworded honestly), visit-based streak (now completion-based). Still-true risks: Web Speech API is Chrome-quality only — the typing fallback is the mitigation; favorites are not yet reimplemented in the new app (Phase 2, persistent).

## Target architecture
- **Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui**
- **Supabase**: auth (email + Google/Apple OAuth), Postgres, RLS
- **Vercel**: hosting, PR preview deployments
- **Speech behind a `SpeechVerifier` interface**: Web Speech API for v1; swappable for on-device Whisper (transformers.js) or server-side Whisper/Deepgram later. Same interface is the AR/VR insurance.
- **PWA from day one**; native wrapper (Capacitor/Expo) only when iOS speech pain demands it.
- Anonymous users get the full core experience (localStorage), with "sign up to keep your streak" merge flow. No login wall before the magic moment.

### Supabase schema (v1)
```
profiles          — id (auth.users FK), display_name, timezone, onboarding goals
affirmation_sets  — the 4 modes → "journeys" later
categories        — set FK, name, sort order
affirmations      — text, success_message, category FK, difficulty, is_premium
sessions          — user, affirmation, completed_at, match_score, attempt_count  ← most valuable table
streaks           — user, current_streak, longest_streak, last_practice_date
favorites         — user + affirmation
subscriptions     — user, plan, status (Stripe webhook mirror)
posts             — blog (or MDX in repo)
```
Content moves from JSON into Postgres → unlocks personalization, A/B testing, premium gating, AI content pipeline with human approval.

## Strategy summary
- **Moat**: (1) verified-action mechanic + behavioral session dataset; (2) streak/history switching costs (Duolingo model); (3) future: voice-energy/confidence feedback — no text competitor can copy; (4) "action over consumption" brand wedge vs Calm/Headspace/Mindvalley.
- **Customers**: beachhead = manifestation/affirmation audience on TikTok/IG (20–40, mostly women). Secondary = habit/science self-optimizers. Different vocabulary per audience ("universe" vs "rewire your brain") — don't mix in one surface.
- **GTM**: mobile experience → short-form video (the live word-highlighting demo IS the content; "say this with me" is a duet/challenge format) → programmatic SEO ("affirmations for X" pages rendered from the affirmations table with an embedded try-it widget) → coach partnerships → paid ads only after retention is proven.
- **Revenue**: freemium sub ($6–8/mo, ~$50/yr). Premium: full library, custom/AI-personalized affirmations, multi-day Journeys, stats, voice feedback. Later: creator journeys (rev share), B2B coach dashboards. Stripe. Don't monetize before retention data.
- **Design revamp**: mobile-first; calm-premium aesthetic (Calm/Headspace/Stoic), keep 4-mode theming but mature the palettes, display typography for the affirmation (hero element), dark mode, restrained motion — the word-lighting effect is the signature, polish it most. Separate marketing pages from the app surface.
- **Content/SEO**: MDX articles in repo + programmatic Supabase-driven landing pages. Science hub with real citations (Cascio 2016, Creswell stress-buffering, Wood 2009 — engage honestly with the backfire finding for credibility).
- **The machine (AI dev workflow)**: CLAUDE.md as standing brief; specs in `docs/roadmap/`; GitHub issue → Claude Code branch → PR → Vercel preview (test on phone) → merge. Guardrails: TS strict, Playwright smoke test of core flow, CI. Separate content-generation pipeline with drafts + human approval in an admin page.
- **Don't forget**: retention (D1/D7/D30 via PostHog) is the whole game; mic privacy transparency; ToS/privacy policy/"not therapy" disclaimer; accessibility (fuzzy matching for accents, typing fallback); lifecycle email (Resend/Loops) replacing raw n8n; move email capture to accounts.

## Roadmap
- **Phase 0 — Foundations**: ✅ done 2026-07-07 (repo in `C:\dev`, Vercel + domain live, bugs fixed, PLAN.md + CLAUDE.md).
- **Phase 1 — Rebuild**: 🟡 mostly done (2026-07-08) — Next.js rebuild live with design system, full practice flow, journeys, science/FAQ, session logging, marketing home at `/` + app hub at `/practice`, GA4 restored, email capture → Supabase (n8n retired; owner must create the project — `docs/supabase.md`). Remaining (see `docs/roadmap/phase-1-rebuild.md`): PWA + click sounds, Playwright smoke test + CI.
- **Phase 2 — Accounts & data (2–3 wks)**: Supabase auth + schema, content in Postgres, server-side streaks + journeys, persistent favorites, anon→account merge, PostHog, admin content page.
- **Phase 3 — Growth engine (ongoing)**: programmatic SEO, blog/science hub, shareable result cards, custom/AI affirmations, daily reminders. (First journeys shipped early, in Phase 1.)
- **Phase 4 — Monetization & beyond**: Stripe premium once D30 retention is healthy; native wrapper if needed; voice-energy experiments; coach/B2B pilot. AR/VR stays a design constraint via the speech interface.

## Migration checklist (Part 4 — dev workflow) — ✅ completed 2026-07-07; kept for reference
1. `mkdir C:\dev` and `git clone <github-repo-url> C:\dev\saythiswithme` (never work inside OneDrive — it corrupts `.git`).
2. Diff the OneDrive copy against the clone; copy over any newer edits + this PLAN.md (as `docs/PLAN.md`); commit + push.
3. Open in VS Code (`code C:\dev\saythiswithme`); local dev server via `npx serve .` (mic works on localhost — it's a secure context).
4. Vercel: import repo (framework preset "Other" for the static site), verify on `*.vercel.app` including the mic flow on a phone.
5. Domain: add `saythiswith.me` + `www` in Vercel → update DNS at registrar with the exact records Vercel shows → wait for SSL → then disable GitHub Pages and delete the `CNAME` file. GitHub Pages stays live during propagation = zero downtime.
6. Start a fresh Claude Code session in `C:\dev\saythiswithme`. First prompt: "Read docs/PLAN.md, then create a CLAUDE.md for this repo and do Phase 0."
