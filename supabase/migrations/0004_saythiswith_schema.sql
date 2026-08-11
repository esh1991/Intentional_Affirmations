-- Say This With Me's tables, in their own schema on the shared platform project.
--
-- Consolidation (2026-08-11): both apps now run off one Supabase project
-- (rxwyuqcsifohiiyvyink) so they share one user pool and one Google identity,
-- while each app keeps its own consent screen. STWM's tables move out of
-- `public` into `saythiswith`; the browser client is pinned to this schema in
-- src/lib/supabase/client.ts.
--
-- This is 0001 + 0003 with `public.` → `saythiswith.`, made idempotent. It is
-- deliberately reconstructed from those files rather than dumped from the old
-- project, so it can be applied without the old project being awake.
--
-- 0002_profiles.sql is NOT reproduced here: `public.profiles` becomes
-- `platform.profiles`, shared with First 100, created by
-- Buffer_Alt/scripts/sql/001_platform.sql.
--
-- Run: from Buffer_Alt, `npm run sql ../saythiswithme/supabase/migrations/0004_saythiswith_schema.sql`

create schema if not exists saythiswith;

-- ---------------------------------------------------------------------------
-- Email capture
-- ---------------------------------------------------------------------------
-- RLS on with no policies: nothing is readable/writable with the publishable
-- key. /api/subscribe uses the secret key, which bypasses RLS.

create table if not exists saythiswith.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  created_at timestamptz not null default now()
);
alter table saythiswith.subscribers enable row level security;

-- ---------------------------------------------------------------------------
-- Per-user data, owner-only RLS
-- ---------------------------------------------------------------------------

-- The most valuable table: every verified completion.
create table if not exists saythiswith.sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  affirmation      text not null,
  mode             text not null,
  category         text not null,
  match_score      numeric not null,
  attempts         int not null default 1,
  input            text not null default 'voice',
  journey_day      int,
  journey_duration int,
  completed_at     timestamptz not null,
  created_at       timestamptz not null default now()
);
create index if not exists sessions_user_completed_idx
  on saythiswith.sessions (user_id, completed_at desc);
alter table saythiswith.sessions enable row level security;

create table if not exists saythiswith.streaks (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  current_streak      int not null default 0,
  longest_streak      int not null default 0,
  -- Local-day ISO date (YYYY-MM-DD) of the last completion.
  last_practice_date  text,
  updated_at          timestamptz not null default now()
);
alter table saythiswith.streaks enable row level security;

create table if not exists saythiswith.stars (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  -- 0-2 toward the 3-star trophy (the third star resets the cycle).
  star_count int not null default 0,
  updated_at timestamptz not null default now()
);
alter table saythiswith.stars enable row level security;

create table if not exists saythiswith.journeys (
  user_id        uuid not null references auth.users (id) on delete cascade,
  mode           text not null,
  category       text not null,
  duration       int not null,
  started_at     text not null,
  -- Array of toDateString() values, mirroring the localStorage shape.
  completed_days jsonb not null default '[]',
  updated_at     timestamptz not null default now(),
  primary key (user_id, mode, category)
);
alter table saythiswith.journeys enable row level security;

create table if not exists saythiswith.favorites (
  user_id     uuid not null references auth.users (id) on delete cascade,
  affirmation text not null,
  mode        text not null,
  category    text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, affirmation)
);
alter table saythiswith.favorites enable row level security;

-- ---------------------------------------------------------------------------
-- Policies (dropped first so the file re-runs cleanly)
-- ---------------------------------------------------------------------------

drop policy if exists "read own sessions"   on saythiswith.sessions;
drop policy if exists "insert own sessions" on saythiswith.sessions;
create policy "read own sessions"   on saythiswith.sessions for select using ((select auth.uid()) = user_id);
create policy "insert own sessions" on saythiswith.sessions for insert with check ((select auth.uid()) = user_id);

drop policy if exists "read own streak"   on saythiswith.streaks;
drop policy if exists "insert own streak" on saythiswith.streaks;
drop policy if exists "update own streak" on saythiswith.streaks;
create policy "read own streak"   on saythiswith.streaks for select using ((select auth.uid()) = user_id);
create policy "insert own streak" on saythiswith.streaks for insert with check ((select auth.uid()) = user_id);
create policy "update own streak" on saythiswith.streaks for update using ((select auth.uid()) = user_id);

drop policy if exists "read own stars"   on saythiswith.stars;
drop policy if exists "insert own stars" on saythiswith.stars;
drop policy if exists "update own stars" on saythiswith.stars;
create policy "read own stars"   on saythiswith.stars for select using ((select auth.uid()) = user_id);
create policy "insert own stars" on saythiswith.stars for insert with check ((select auth.uid()) = user_id);
create policy "update own stars" on saythiswith.stars for update using ((select auth.uid()) = user_id);

drop policy if exists "read own journeys"   on saythiswith.journeys;
drop policy if exists "insert own journeys" on saythiswith.journeys;
drop policy if exists "update own journeys" on saythiswith.journeys;
create policy "read own journeys"   on saythiswith.journeys for select using ((select auth.uid()) = user_id);
create policy "insert own journeys" on saythiswith.journeys for insert with check ((select auth.uid()) = user_id);
create policy "update own journeys" on saythiswith.journeys for update using ((select auth.uid()) = user_id);

drop policy if exists "read own favorites"   on saythiswith.favorites;
drop policy if exists "insert own favorites" on saythiswith.favorites;
drop policy if exists "delete own favorites" on saythiswith.favorites;
create policy "read own favorites"   on saythiswith.favorites for select using ((select auth.uid()) = user_id);
create policy "insert own favorites" on saythiswith.favorites for insert with check ((select auth.uid()) = user_id);
create policy "delete own favorites" on saythiswith.favorites for delete using ((select auth.uid()) = user_id);

-- sync.ts upserts favorites on conflict (user_id, affirmation); an upsert that
-- lands on an existing row is an UPDATE, which the original public.* policies
-- never granted. It worked there only because the union of insert+delete
-- covered the paths actually taken. Grant it explicitly.
drop policy if exists "update own favorites" on saythiswith.favorites;
create policy "update own favorites" on saythiswith.favorites for update using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
-- A fresh schema has none. Without these, PostgREST fails even though the
-- schema is listed under Exposed schemas and the tables plainly exist.

grant usage on schema saythiswith to anon, authenticated, service_role;
grant all on all tables    in schema saythiswith to anon, authenticated, service_role;
grant all on all sequences in schema saythiswith to anon, authenticated, service_role;
alter default privileges in schema saythiswith grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema saythiswith grant all on sequences to anon, authenticated, service_role;
