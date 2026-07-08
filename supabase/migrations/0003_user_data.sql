-- Phase 2 M1/M2: per-user data with owner-only RLS.
-- Run after 0002 in the Supabase SQL editor.

-- The most valuable table: every verified completion.
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  affirmation text not null,
  mode text not null,
  category text not null,
  match_score numeric not null,
  attempts int not null default 1,
  input text not null default 'voice',
  journey_day int,
  journey_duration int,
  completed_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index sessions_user_completed_idx on public.sessions (user_id, completed_at desc);
alter table public.sessions enable row level security;
create policy "read own sessions" on public.sessions
  for select using ((select auth.uid()) = user_id);
create policy "insert own sessions" on public.sessions
  for insert with check ((select auth.uid()) = user_id);

create table public.streaks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  -- Local-day ISO date (YYYY-MM-DD) of the last completion.
  last_practice_date text,
  updated_at timestamptz not null default now()
);
alter table public.streaks enable row level security;
create policy "read own streak" on public.streaks
  for select using ((select auth.uid()) = user_id);
create policy "insert own streak" on public.streaks
  for insert with check ((select auth.uid()) = user_id);
create policy "update own streak" on public.streaks
  for update using ((select auth.uid()) = user_id);

create table public.stars (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- 0-2 toward the 3-star trophy (the third star resets the cycle).
  star_count int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.stars enable row level security;
create policy "read own stars" on public.stars
  for select using ((select auth.uid()) = user_id);
create policy "insert own stars" on public.stars
  for insert with check ((select auth.uid()) = user_id);
create policy "update own stars" on public.stars
  for update using ((select auth.uid()) = user_id);

create table public.journeys (
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null,
  category text not null,
  duration int not null,
  started_at text not null,
  -- Array of toDateString() values, mirroring the localStorage shape.
  completed_days jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  primary key (user_id, mode, category)
);
alter table public.journeys enable row level security;
create policy "read own journeys" on public.journeys
  for select using ((select auth.uid()) = user_id);
create policy "insert own journeys" on public.journeys
  for insert with check ((select auth.uid()) = user_id);
create policy "update own journeys" on public.journeys
  for update using ((select auth.uid()) = user_id);

create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  affirmation text not null,
  mode text not null,
  category text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, affirmation)
);
alter table public.favorites enable row level security;
create policy "read own favorites" on public.favorites
  for select using ((select auth.uid()) = user_id);
create policy "insert own favorites" on public.favorites
  for insert with check ((select auth.uid()) = user_id);
create policy "delete own favorites" on public.favorites
  for delete using ((select auth.uid()) = user_id);

-- 0002 only added select/update on profiles (the trigger inserts). The
-- account page upserts the display name, so users need insert too.
create policy "insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);
