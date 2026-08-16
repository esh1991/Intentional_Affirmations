-- Phase 3 — the portal: future selves, their arcs, and the generation jobs
-- that produce them. Spec: docs/roadmap/phase-3-portal.md
--
-- Run: from Buffer_Alt, `npm run sql ../saythiswithme/supabase/migrations/0005_portal.sql`
-- (this repo has no Supabase CLI link). Idempotent, in 0004's style.
--
-- ⚠️ READ BEFORE ADDING A TABLE HERE
-- 0004 ends with:
--     alter default privileges in schema saythiswith
--       grant all on tables to anon, authenticated, service_role;
-- so **every new table in this schema is granted ALL to `anon` on creation**.
-- `enable row level security` is therefore mandatory on each one, not hygiene:
-- without it a table is world-readable and world-writable with the publishable
-- key. Owner-only policies on (select auth.uid()) = user_id, mirroring 0004.
--
-- Tables whose rows are reached only through a parent (arc_days) carry no
-- user_id; they are locked down by an exists() check against the parent.

-- ---------------------------------------------------------------------------
-- Future selves
-- ---------------------------------------------------------------------------
-- One row per version of themselves a user has reached. `portrait_url` points
-- at Vercel Blob, never at bytes in Postgres. The source selfie is deleted the
-- moment the portrait exists, so this row is the only lasting artefact — see
-- the photo policy in the spec.

create table if not exists saythiswith.future_selves (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  domain       text not null,
  goal         text not null,
  horizon      text not null,
  persona      jsonb not null default '{}'::jsonb,
  portrait_url text,
  provider_ref text,
  created_at   timestamptz not null default now()
);

create index if not exists future_selves_user_idx
  on saythiswith.future_selves (user_id, created_at desc);

alter table saythiswith.future_selves enable row level security;

drop policy if exists "read own future_selves"   on saythiswith.future_selves;
drop policy if exists "insert own future_selves" on saythiswith.future_selves;
drop policy if exists "update own future_selves" on saythiswith.future_selves;
drop policy if exists "delete own future_selves" on saythiswith.future_selves;
create policy "read own future_selves"   on saythiswith.future_selves for select using ((select auth.uid()) = user_id);
create policy "insert own future_selves" on saythiswith.future_selves for insert with check ((select auth.uid()) = user_id);
create policy "update own future_selves" on saythiswith.future_selves for update using ((select auth.uid()) = user_id);
create policy "delete own future_selves" on saythiswith.future_selves for delete using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Arcs
-- ---------------------------------------------------------------------------
-- The cloud copy of a commitment arc. localStorage stays the UI's source of
-- truth (sync.ts merges); this is the durable side. `completed_days` mirrors
-- the existing journeys shape — toDateString() values, max one per local day.
-- Duration is 7 or 21; 14 was retired 2026-08-15 but is not rejected here, so
-- any row already carrying it still loads (normalizeDuration coerces it).

create table if not exists saythiswith.arcs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  future_self_id uuid references saythiswith.future_selves(id) on delete cascade,
  duration       int not null check (duration between 1 and 21),
  started_at     text not null,
  completed_days jsonb not null default '[]'::jsonb,
  status         text not null default 'active',
  created_at     timestamptz not null default now()
);

create index if not exists arcs_user_idx on saythiswith.arcs (user_id, created_at desc);

alter table saythiswith.arcs enable row level security;

drop policy if exists "read own arcs"   on saythiswith.arcs;
drop policy if exists "insert own arcs" on saythiswith.arcs;
drop policy if exists "update own arcs" on saythiswith.arcs;
drop policy if exists "delete own arcs" on saythiswith.arcs;
create policy "read own arcs"   on saythiswith.arcs for select using ((select auth.uid()) = user_id);
create policy "insert own arcs" on saythiswith.arcs for insert with check ((select auth.uid()) = user_id);
create policy "update own arcs" on saythiswith.arcs for update using ((select auth.uid()) = user_id);
create policy "delete own arcs" on saythiswith.arcs for delete using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Arc days
-- ---------------------------------------------------------------------------
-- The generated 21 entries. This is where affirmations finally get **stable
-- ids**, retiring the text-as-primary-key fragility running through favorites,
-- sessions and sync.ts.
--
-- No user_id column on purpose: ownership is the parent arc's. The policies
-- below reach through it, so a leaked arc id still yields nothing.

create table if not exists saythiswith.arc_days (
  id              uuid primary key default gen_random_uuid(),
  arc_id          uuid not null references saythiswith.arcs(id) on delete cascade,
  day_index       int not null check (day_index between 1 and 21),
  affirmation     text not null,
  success_message text,
  unique (arc_id, day_index)
);

create index if not exists arc_days_arc_idx on saythiswith.arc_days (arc_id, day_index);

alter table saythiswith.arc_days enable row level security;

drop policy if exists "read own arc_days"   on saythiswith.arc_days;
drop policy if exists "insert own arc_days" on saythiswith.arc_days;
drop policy if exists "update own arc_days" on saythiswith.arc_days;
drop policy if exists "delete own arc_days" on saythiswith.arc_days;
create policy "read own arc_days" on saythiswith.arc_days for select
  using (exists (
    select 1 from saythiswith.arcs a
    where a.id = arc_days.arc_id and a.user_id = (select auth.uid())
  ));
create policy "insert own arc_days" on saythiswith.arc_days for insert
  with check (exists (
    select 1 from saythiswith.arcs a
    where a.id = arc_days.arc_id and a.user_id = (select auth.uid())
  ));
create policy "update own arc_days" on saythiswith.arc_days for update
  using (exists (
    select 1 from saythiswith.arcs a
    where a.id = arc_days.arc_id and a.user_id = (select auth.uid())
  ));
create policy "delete own arc_days" on saythiswith.arc_days for delete
  using (exists (
    select 1 from saythiswith.arcs a
    where a.id = arc_days.arc_id and a.user_id = (select auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- Portal conversations
-- ---------------------------------------------------------------------------
-- The transcript that ends in a promise. Also the substrate for later
-- personalisation (the guide remembering prior calls) — designed for now,
-- built after MVP retention data.

create table if not exists saythiswith.portal_conversations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  future_self_id uuid references saythiswith.future_selves(id) on delete cascade,
  transcript     jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists portal_conversations_user_idx
  on saythiswith.portal_conversations (user_id, created_at desc);

alter table saythiswith.portal_conversations enable row level security;

drop policy if exists "read own portal_conversations"   on saythiswith.portal_conversations;
drop policy if exists "insert own portal_conversations" on saythiswith.portal_conversations;
drop policy if exists "update own portal_conversations" on saythiswith.portal_conversations;
drop policy if exists "delete own portal_conversations" on saythiswith.portal_conversations;
create policy "read own portal_conversations"   on saythiswith.portal_conversations for select using ((select auth.uid()) = user_id);
create policy "insert own portal_conversations" on saythiswith.portal_conversations for insert with check ((select auth.uid()) = user_id);
create policy "update own portal_conversations" on saythiswith.portal_conversations for update using ((select auth.uid()) = user_id);
create policy "delete own portal_conversations" on saythiswith.portal_conversations for delete using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Generation jobs
-- ---------------------------------------------------------------------------
-- Every paid generation is a row, never a bare request: the client POSTs, gets
-- an id, and polls while the portal plays its "finding them" sequence. The
-- wait is the theatre.
--
-- The (user_id, created_at desc) index is the quota check — counting a
-- caller's jobs in the last 24h is the only thing standing between this app
-- and an endpoint that spends money on demand.
--
-- Rows are written with the service-role key, which bypasses RLS. The policies
-- exist so the browser client can *read* its own job status and nothing else;
-- there is deliberately no insert policy, so a job cannot be created except
-- through the quota-checked route.

create table if not exists saythiswith.generation_jobs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  kind            text not null,
  status          text not null default 'pending',
  provider        text,
  provider_job_id text,
  result_url      text,
  cost_cents      int,
  error           text,
  created_at      timestamptz not null default now()
);

create index if not exists generation_jobs_user_created_idx
  on saythiswith.generation_jobs (user_id, created_at desc);

alter table saythiswith.generation_jobs enable row level security;

drop policy if exists "read own generation_jobs" on saythiswith.generation_jobs;
create policy "read own generation_jobs" on saythiswith.generation_jobs for select
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- sessions.arc_day_id
-- ---------------------------------------------------------------------------
-- Additive and non-destructive. The denormalised `affirmation` text stays for
-- display and analytics continuity; this gives each completion a stable
-- pointer to the line that was spoken.

alter table saythiswith.sessions
  add column if not exists arc_day_id uuid references saythiswith.arc_days(id) on delete set null;

create index if not exists sessions_arc_day_idx
  on saythiswith.sessions (arc_day_id);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
-- 0004's `alter default privileges` already covers tables created here, but
-- state these explicitly so this file is correct if applied to a schema where
-- those defaults were never set.

grant usage on schema saythiswith to anon, authenticated, service_role;
grant all on all tables    in schema saythiswith to anon, authenticated, service_role;
grant all on all sequences in schema saythiswith to anon, authenticated, service_role;
