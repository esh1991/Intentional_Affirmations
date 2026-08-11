# Supabase setup

*Started 2026-07-08 with email capture; Phase 2 (accounts) built on the same project — spec in `docs/roadmap/phase-2-accounts.md`. SQL lives in `supabase/migrations/` (numbered; run them in order in the SQL editor — no CLI needed).*

## Project — shared, since 2026-08-11

This app no longer has its own Supabase project. It shares one with **First 100**
(`c:\dev\Buffer_Alt`), so both apps have a single user pool: sign in to either with the same
Google account and it's the same `auth.users` row.

Each app keeps its own consent screen anyway, because sign-in uses the Google
**ID-token flow** (`signInWithIdToken`) rather than the redirect flow. The redirect flow uses
the one Google client configured on the Supabase project, so every app on it would show the
same "Sign in to X" screen. See `src/lib/auth/google.ts`.

### Schemas

| Schema | Holds | Exposed to PostgREST |
|---|---|---|
| `saythiswith` | this app: subscribers, sessions, streaks, stars, journeys, favorites | yes |
| `platform` | shared: profiles, entitlements | yes |
| `first100` | First 100's data — not ours, never queried from here | **no** |

Nothing of ours is in `public` any more. The browser client is pinned to `saythiswith` at
construction and `platformDb()` overrides it per query (`src/lib/supabase/client.ts`).

⚠ `first100` is deliberately **not** exposed: its tables carry no RLS because that app talks
to Postgres directly and enforces ownership in code. Adding it to Exposed schemas would
publish every row to anyone holding the publishable key.

## Environment variables

Set in Vercel (Project → Settings → Environment Variables) **and** locally in `.env.local`
(gitignored):

```
SUPABASE_URL=https://<shared-ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...

# Client-side (publishable key is browser-safe, RLS guards data)
NEXT_PUBLIC_SUPABASE_URL=https://<shared-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# This app's OWN Google OAuth client — this is what makes the consent screen
# say "Say This With Me" rather than the other app's name.
NEXT_PUBLIC_GOOGLE_CLIENT_ID=....apps.googleusercontent.com
```

Until the server pair is set, `/api/subscribe` returns 503 and the home-page form shows a
friendly error; until the `NEXT_PUBLIC_` pair is set, all auth UI hides itself — nothing else
breaks. `NEXT_PUBLIC_` values are inlined at build time, so Vercel needs a **redeploy** after
changing them, not just a save.

## Tables

`supabase/migrations/0004_saythiswith_schema.sql` is the current source of truth — it creates
every table, index, RLS policy and grant under `saythiswith`. Files 0001–0003 are the
historical `public.*` versions, kept for the record; don't run them against the shared
project. `0002_profiles.sql` in particular is superseded: profiles moved to
`platform.profiles` (keyed on `user_id`, not `id`), created by
`Buffer_Alt/scripts/sql/001_platform.sql`.

A new schema starts with no grants, which is the failure worth knowing: PostgREST returns a
"schema must be one of the following" error even though the table plainly exists and the
schema is listed under Exposed schemas. The grant block at the bottom of 0004 is the fix.

## Gotchas

- `/api/subscribe` speaks to PostgREST directly rather than through supabase-js, so it
  doesn't inherit the client's schema pinning — it sends `Content-Profile: saythiswith`
  explicitly. Reads would need `Accept-Profile`.
- Sign-in is Google-only. The email-code path was removed in the consolidation: Supabase's
  built-in mailer is rate-limited to a handful of messages an hour, and one project serving
  two apps can only have one email template. Practice works fully signed-out, so this costs
  cloud sync, not the app.
- `SUPABASE_SECRET_KEY` is server-only — never client-side or `NEXT_PUBLIC_`.
