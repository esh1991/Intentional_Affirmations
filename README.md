# Say This With Me

Voice-activated mindset engine — speak affirmations out loud, get verified by
speech recognition with live word highlighting, build a daily streak.
Live at [saythiswith.me](https://www.saythiswith.me).

- **Plan & strategy:** [`docs/PLAN.md`](docs/PLAN.md)
- **Current work (Phase 1 rebuild spec):** [`docs/roadmap/phase-1-rebuild.md`](docs/roadmap/phase-1-rebuild.md)
- **Agent brief:** [`CLAUDE.md`](CLAUDE.md)

## Stack

Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Zod.
Deployed on Vercel. The pre-rewrite static site lives in [`legacy/`](legacy/)
for reference during the port.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000 — mic works (localhost is a secure context)
npm run build   # production build + typecheck
npm run lint
```
