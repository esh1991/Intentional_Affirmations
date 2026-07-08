-- Phase 1 email capture (applied 2026-07-08). Kept here for the record;
-- originally documented in docs/supabase.md.

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

-- RLS on with no policies: nothing is readable/writable with the publishable
-- key. /api/subscribe uses the secret key, which bypasses RLS.
alter table public.subscribers enable row level security;
