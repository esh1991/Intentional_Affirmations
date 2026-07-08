# Supabase setup

*Started 2026-07-08 with email capture; Phase 2 (accounts) builds on the same project — spec in `docs/roadmap/phase-2-accounts.md`. SQL lives in `supabase/migrations/` (numbered; run them in order in the SQL editor — no CLI needed).*

## Project

One Supabase project serves the app. Create it at [supabase.com](https://supabase.com) (free tier), then collect:

- **Project URL** — Settings → API → `https://<ref>.supabase.co`
- **Secret key** — Settings → API keys → a `sb_secret_...` key (or the legacy `service_role` JWT; both work). Server-side only — never expose it client-side or prefix it `NEXT_PUBLIC_`.

## Environment variables

Set in Vercel (Project → Settings → Environment Variables) **and** locally in `.env.local` (gitignored):

```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...

# Phase 2 (client-side auth; the publishable key is browser-safe, RLS guards data)
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Until the server pair is set, `/api/subscribe` returns 503 and the home-page form shows a friendly error; until the `NEXT_PUBLIC_` pair is set, all auth UI hides itself — nothing else breaks. `NEXT_PUBLIC_` values are inlined at build time, so Vercel needs a redeploy after adding them.

## Tables

### `subscribers` (email capture, live)

Run in the SQL editor:

```sql
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

-- RLS on with no policies: nothing is readable/writable with the public
-- (anon/publishable) key. /api/subscribe uses the secret key, which bypasses RLS.
alter table public.subscribers enable row level security;
```

`/api/subscribe` upserts on `email`, so duplicate signups succeed quietly.

## Phase 2 (not yet built)

Auth, `profiles`, `sessions` (seeded from the `mindsetEngineSessions` localStorage log), `streaks`, `favorites`, content tables — see `docs/PLAN.md` for the target schema.
