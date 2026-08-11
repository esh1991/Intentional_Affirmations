# The shared backend — read this before touching auth, schemas or billing

_Established 2026-08-11. This file is duplicated in `c:\dev\saythiswithme\docs\shared-backend.md`;
keep them in sync._

**First 100** and **Say This With Me** run on **one Supabase project, `rxwyuqcsifohiiyvyink`**,
with one `auth.users` pool. Sign in to either app with the same Google account and it is the
same person, same `user_id`. They stay separate everywhere else: separate repos, separate
Vercel projects, separate domains, separate Postgres schemas, and — the hard part — separate
Google consent screens.

This replaces the previous arrangement in both directions. First 100 originally co-tenanted
inside Say This With Me's project (`ykdiptjrfpxpuvbcufej`), was split out to its own project
on 2026-07-23 specifically to get its own consent screen, and both were consolidated back
here once the ID-token flow made shared branding unnecessary. If you find a doc describing
either older state, it is stale.

---

## The layout

| Schema | Contents | Exposed to PostgREST | RLS |
|---|---|---|---|
| `first100` | First 100's tables | **NO — never** | none |
| `saythiswith` | Say This With Me's tables | yes | every table, owner-only |
| `platform` | `profiles`, `entitlements` — shared | yes | yes |
| `auth` | one user pool for both apps | n/a | Supabase-managed |

### ⚠ `first100` must never be added to Exposed schemas

Its tables carry **no RLS at all**. That is not an oversight — First 100 reaches Postgres
directly (drizzle over `postgres.js`) and enforces ownership in application code, in
`Buffer_Alt/lib/pg/store.ts`. Nothing about that is safe to expose through PostgREST: adding the schema
to *Project Settings → API → Exposed schemas* would publish every row to anyone holding the
publishable key, which ships in the browser bundle.

Verify it is still shut with:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "apikey: $PUBLISHABLE_KEY" -H "Accept-Profile: first100" \
  https://rxwyuqcsifohiiyvyink.supabase.co/rest/v1/
# 406 = correct. 200 = every row is public. Fix immediately.
```

The other two schemas need `usage` + table grants on top of being listed as exposed. A fresh
schema has neither, and the failure looks nothing like a permissions problem — PostgREST
answers *"schema must be one of the following"* even though the table plainly exists. The
grant blocks at the bottom of `Buffer_Alt/scripts/sql/001_platform.sql` and
`supabase/migrations/0004_saythiswith_schema.sql` are the fix.

---

## Sign-in: the ID-token flow, and why it can't go back

A Supabase project's Google provider holds **one** client for the redirect flow, and the
"Sign in to X" consent screen takes its name from the Google Cloud *project* that owns that
client. So `signInWithOAuth` on a shared project = one consent screen for every app on it.
That single fact is what forced the July split.

Both apps therefore use `supabase.auth.signInWithIdToken()` with Google Identity Services.
Each app has its **own Google Cloud project** and its own OAuth client, so each gets its own
branding. Supabase validates the token's `aud` against the comma-separated list in
*Authentication → Providers → Google → **Client IDs***.

| | First 100 | Say This With Me |
|---|---|---|
| Google Cloud project | `First 100` | `Say This With Me` |
| Client ID prefix | `1078702590143-…` | `271981939483-…` |
| Env var | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| Code | `lib/auth/google.ts`, `app/login/page.tsx` | `src/lib/auth/google.ts`, `src/components/auth/signin-form.tsx` |

Full console walkthrough: `c:devBuffer_Altdocsgoogle-auth-setup.md`.

**Things that will break this, in rough order of likelihood:**

1. **Removing either client id from Supabase's Client IDs field.** That app's sign-in dies
   instantly with *"Unacceptable audience in id_token"*. Both must be listed; First 100's
   stays first because Supabase treats the leading entry as the web client paired with the
   Client Secret.
2. **Reverting to `signInWithOAuth`.** It will appear to work — and silently collapse both
   apps onto one consent screen, undoing the entire point.
3. **First 100 only: using plain `supabase-js` on the login page.** It must use the
   `@supabase/ssr` browser client from `lib/supabase/client.ts`. `middleware.ts` gates the
   whole app on a **cookie** session and cannot read localStorage. Get this wrong and sign-in
   appears to succeed, then bounces to `/login` forever with nothing in the logs.
4. **Turning on "Skip nonce checks".** Both apps send a real nonce (`makeNonce()`); enabling
   this accepts an ID token bearing any nonce, for no benefit.
5. **Adding a Google API scope.** Stay on `email`, `profile`, `openid`. Anything more moves
   the app into slow brand verification.

**A permanent limitation to design around:** the ID-token flow issues **no refresh token**,
so neither app can ever call a Google API on a user's behalf — no Sheets, Drive or Calendar.
An app needing that must use the authorization-code flow with offline access and **cannot
share this sign-in path**. It would need its own Supabase project again.

**There is no email/password or magic-link sign-in, deliberately.** One project has one set
of auth email templates and one sender, so branded login emails for two apps aren't possible
without routing them through a Send Email Hook and your own mail provider. Google-only side-
steps it. Adding any email-based method means solving that first — don't half-add it.

---

## Entitlements

`platform.entitlements` is keyed `(user_id, app)` and replaced `first100.accounts` on
2026-08-11. `Buffer_Alt/lib/plan.ts` is the only module that touches it.

**Every query must filter by `app`.** A user paying for one app is a free user everywhere
else. In `Buffer_Alt/lib/plan.ts` this is enforced structurally by the `mine()` helper — keep it that
way rather than hand-writing the filter per query.

The place it genuinely bites is `accountByStripeCustomer()`. One Stripe account serves every
app here, so the same `stripe_customer_id` can legitimately appear on two rows; without the
app filter a First 100 webhook could flip the wrong app's entitlement.

`first100.accounts` still exists, holding its pre-migration rows. It is the rollback, not
live data. Nothing reads it. Don't drop it without a reason to.

Also note `first100.projects.owner` is `text` while `entitlements.user_id` is `uuid`, so raw
SQL joining them needs `p.owner = a.user_id::text` (see
`Buffer_Alt/app/api/f1/admin/analytics/route.ts`).

---

## Free-tier operational facts

- **Two active projects, account-wide.** A third must be paused. This is why the migration
  ran as three rounds with pause/unpause switches rather than a straight copy.
- **A paused project stops resolving in DNS entirely** — you get `ENOTFOUND`, not a timeout
  or an auth error. `Buffer_Alt/scripts/export-stwm.mjs` detects this and says so.
- **Free projects pause after a week of inactivity** and have **no daily backups**. This one
  project is now the single point of failure for two apps. Pro ($25/mo per *organization*)
  buys backups, no auto-pause and no project cap. The backups are the real argument.
- The old Say This With Me project `ykdiptjrfpxpuvbcufej` is **paused, not deleted** — keep
  it until at least **mid-September 2026**. Its full export is at
  `c:\dev\.migration\stwm-export.json`, which reproduces the data independently of either
  project.

---

## Migration tooling

| Script | Purpose |
|---|---|
| `npm run sql <file.sql>` | Run a SQL file against `DATABASE_URL`, simple protocol, multi-statement |
| `Buffer_Alt/scripts/sql/001_platform.sql` | Creates `platform` — idempotent, safe to re-run |
| `npm run export:stwm` | Read-only export of the old project over REST |
| `npm run import:stwm` | Load an export in. `--dry-run` = plan only, `--rehearse` = every write inside a rolled-back transaction |

**`--rehearse` is the mode that matters.** `--dry-run` only prints the id map and proves
nothing about whether the writes work. Rehearsal executes all of them and rolls back — it is
how the `auth.identities.email` generated-column failure was caught before it could happen
mid-migration. If you ever import users again, rehearse first.

---

## Hard-won details (don't rediscover these)

- **`auth.identities.email` and `auth.users.confirmed_at` are `GENERATED ALWAYS` columns.**
  Naming either in an INSERT fails with *"cannot insert a non-DEFAULT value"*. Build inserts
  from `information_schema.columns WHERE is_generated = 'NEVER'`.
- **The admin users LIST endpoint returns `identities: null`.** Only
  `GET /auth/v1/admin/users/{id}` populates them. An export built on the list endpoint alone
  produces users with no Google identity, who then cannot sign in — and whose later Google
  sign-in risks a duplicate account instead of re-linking.
- **In the per-user identity shape, the provider's subject id is `id`**, not `provider_id`
  (that lives inside `identity_data`). Normalise on the way out.
- **Supabase's dashboard field is "Client IDs" (plural, one box).** Older docs describe a
  primary *Client ID* plus a separate *Authorized Client IDs* list; they were merged.
- **A user who authenticates but fails the allow-list still gets an `auth.users` row** — and
  the `platform.handle_new_user` trigger still creates their profile. Rejected-at-the-gate is
  not the same as not-signed-up.
- **`supabase.schema('x')` overrides the schema per query**, which is why Say This With Me
  uses one client rather than the two-client pattern most guides show. Two `createClient()`
  calls against one URL means two GoTrue instances sharing a storage key, racing on refresh.
- **Deleting an `auth.users` row now cascades across two schemas** — `platform.profiles`,
  `platform.entitlements` and every `saythiswith.*` table. Test account deletion after any
  change to that area.

## Verifying the whole thing still works

```sql
-- One person, one row, however many apps they use.
select u.email, count(i.*) identities,
       (select count(*) from platform.entitlements e where e.user_id = u.id) ents
from auth.users u left join auth.identities i on i.user_id = u.id
group by u.id, u.email;

-- No duplicate humans.
select lower(email), count(*) from auth.users group by 1 having count(*) > 1;
```

The end-to-end check is: sign in to **both** apps with the same Google account, confirm each
consent screen shows its own app name, then confirm `auth.users` did not grow by two.
