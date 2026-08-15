# Phase 3 — The Portal: Say This With *Me*

*Spec opened 2026-08-15. Full strategic plan lives in the session plan doc; this file is the
build record — update the milestone checkboxes as work lands.*

## Premise

Somewhere ahead of you is a version of you who already achieved the thing you're dreaming
about now. The app is the line to them. You say which version you're reaching for, they come
into focus, they tell you what they know, and they hand you a promise to say out loud. The
daily practice becomes a standing call with the person you're becoming.

`saythiswith.me` already reads **say this with *me*** — and "me" is now the future self on the
other end. The word-by-word highlight stops being a verification gimmick and becomes the sound
of two versions of you speaking together.

## Owner decisions

**Taken 2026-08-12:**

1. **Narrative** — vivid portal experience, honest mechanism underneath. The app never claims
   physics. `/science` gets *stronger*: self-continuity, episodic future thinking and
   commitment-device research are exactly what a vivid future self delivers.
2. **Imagery** — photoreal, identity-preserving, graded as a transmission. It must be
   recognisably *you*; that's the whole motivational payload.
3. **Voice** — text conversation first, spoken future self next.
4. **Structure** — full replacement. The 4-mode / 13-category browse hub retires; every
   journey originates from a portal conversation.

**Taken 2026-08-15:**

5. **Pop-culture grammar — the verse-jump.** The *finding* moment borrows the multiverse
   jump: possible lives flicker past in hard jump-cuts before one locks. The *contact* moment
   stays still and quiet — the payoff is the absence of motion.

   The mapping that makes this more than a costume: in the source material you jump by doing
   something improbable. Here, **the improbable act is saying the words out loud.** Speech is
   the portal key, which is the mechanic the app already has.

   Borrow the *grammar*, never the assets or marks: no googly eyes, no bagel, no mandala
   sparks, and no film named in product copy.
6. **Durations: 7 and 21 only.** 14 is retired. 7 = try it, 21 = become it; the middle option
   added a third sampling path and a third decision for no narrative gain. Shipped in M1 —
   `normalizeDuration()` keeps journeys already stored at 14 rendering, coerced to 21.
7. **fal for MVP, not Higgsfield.** See providers below.
8. **The premise animation is code, not generated video.** See providers below.
9. **Quantum Jumping is the lineage, not the label.** Take Goldman's threshold ritual and
   alter-ego framing; refuse the name, the physics and the skill-download claim. Anchor the
   science on future-self continuity instead. See the two sections below.

## Lineage: Burt Goldman's Quantum Jumping

*Raised by the owner 2026-08-15. This is a closer precedent than the film, and unlike the film
it comes with a market record and a ritual structure.*

Burt Goldman — a Silva Method instructor who worked in the mind-power tradition and taught into
his nineties — built a program around a guided visualization: relax, walk a corridor, step
through a door into a parallel universe, meet the version of yourself who took the other path
and already mastered the thing you want, and bring their skill and confidence back with you.
His own proof was biographical rather than experimental: he took up painting, photography and
music in his eighties and became genuinely accomplished at them.

**It was distributed by Mindvalley** — already this project's design reference. Same audience,
same vocabulary, and a demonstrated willingness to pay for precisely this experience.

### What to take

| Element | How it lands here |
|---|---|
| The alter ego who already made it | Already the premise. Goldman confirms it rather than changes it. |
| **The threshold ritual** | The missing piece. Goldman's method is not "imagine success" — it is a *repeatable entry sequence*: settle → corridor → door → cross → meet → receive → return. A daily-practice app needs a consistent doorway, and this is a proven one. |
| Receiving something to bring back | Maps exactly onto the promise — the line you carry into the day. |
| **The return** | The sequence must *close*, not just stop. Currently the demo ends on "verified"; it should come back through the door. |

The ritual point is the valuable one. A standing daily call needs the same doorway every time —
that is what turns a feature into a practice, and it is the difference between the portal being
a one-off reveal and being the thing you come back to on day 14.

### What to refuse

- **The name.** "Quantum Jumping" is Goldman/Mindvalley branded. It never appears in product copy.
- **The physics.** No parallel universes as mechanism, no "quantum" as an explanation word. This
  would break the standing honest-science brand rule exactly as hard as "21 days rewires the
  brain" does — and this app's whole wedge against Calm/Headspace/Mindvalley is that it does not
  do that.
- **"Downloading" a skill.** The claim that you acquire an ability by visualising someone who
  has it. What actually transfers is self-efficacy, motivation and rehearsal. That is still a
  lot — it just is not telepathy.

The narrative may stay vivid. The *mechanism* stays honest. Decision 1 already settled this;
Goldman is the sharpest test of it so far.

## The honest twin: future-self continuity

Goldman's experience has a legitimate scientific counterpart that is almost eerily on the nose,
and it is what lets the app deliver his experience without his claims.

**Hal Hershfield's future-self continuity research** — most relevantly the age-progressed
rendering work (Hershfield et al., 2011, *Increasing Saving Behavior Through Age-Progressed
Renderings of the Future Self*) — showed people **photorealistic renderings of their own future
face** and measured real behaviour change downstream. The mechanism is continuity: people who
feel connected to their future self discount the future less and treat it better.

That is precisely what this app proposes to do with a GenAI portrait. **This is not a
nice-to-have citation — it is the scientific licence for the entire photo feature**, and it
should anchor the `/science` rewrite in M5.

Supporting and already partly on `/science`:

- Episodic future thinking reduces delay discounting (Peters & Büchel).
- Implementation intentions (Gollwitzer) — the future self should hand over a *specific* next
  action, not a mood.
- Self-affirmation and stress buffering (Creswell; Cascio et al. 2016).
- The backfire finding (Wood 2009) — already engaged honestly, keep it.

### The caveat that changes the design

Oettingen's work on **mental contrasting** is the one finding that argues against a naive
version of this app, so it shapes the product rather than getting buried:

> **Positive fantasy alone can reduce effort.** Vividly enjoying an achieved future can drain
> the motivation to pursue it — you collect some of the reward without doing the work.

The corrective is contrast: pair the vivid future with the present obstacle, then form an
implementation intention. Three non-negotiable design consequences:

1. **The future self names the obstacle, it does not just glow.** "I know what you are going to
   want to do at 9pm tonight" beats "it is wonderful here." Warmth plus friction, never warmth alone.
2. **The promise is an action for today, not a description of the destination.** The existing
   Notice→Act→Become arc structure already does this — one more reason the 273 approved entries
   stay as the style contract.
3. **The reveal is the hook; the rep is the product.** The portrait must always hand off to the
   mic within one screen. A portal that ends at the portrait is the exact failure mode Oettingen
   describes.

This is also the answer to "isn't this just manifestation?" — no. Manifestation stops at the
vision. This stops at a verified rep, out loud, that we can prove you did.

## The ritual spine

*Owner approved 2026-08-15: build it into the demo now and make it the structure of `/portal`
and `/pact`.*

One sequence, used in three places, so the shape is learned once and never changes:

| Beat | Home demo (M1, shipped) | `/portal` first run (M2–M4) | `/pact` daily call (M4) |
|---|---|---|---|
| **Threshold** | "Step through." Doorway opens. | Same doorway. Consent + coordinates sit *before* it, so the door is always the last thing before contact. | Same doorway, every single day. This is the ritual anchor. |
| **Scan** | Possible lives cut past | Genuinely searching — the portrait job is running behind it. The wait is the theatre. | Skipped: they are already found. |
| **Lock / contact** | Rings contract, stillness | The portrait resolves | A brief re-connect, not a re-reveal |
| **They speak** | One pre-baked line | The streaming conversation | The day's line, in their voice |
| **Receive** | The promise appears | The promise ends the conversation | Today's arc line |
| **Say it back** | Words light up | `<SpeakTheLine>` | `<SpeakTheLine>` |
| **Return** | "Come back. Bring it with you." Door closes on the lit line. | Into the arc | "Same door tomorrow." Streak + dots land here. |

Two rules this creates:

1. **The door never changes.** Not per domain, not per day, not per streak length. Variable
   ritual is not ritual. Domain accent colours may tint it; the shape and the timing do not move.
2. **The return is where the reward lands.** Stars, streak and journey dots resolve on the way
   back out, not at the moment of verification — the sequence should close on gain, and it
   gives the existing `recordCompletion()` path a natural home in the new flow.

## Architecture

```
/                    self-playing portal demo (no auth, no cost)
/portal              tune → find → reveal → converse → the promise → the pact
/pact                today's call: future self speaks the day's line, you say it back
/science /faq /account /legal/*    survive; /science rewritten stronger
```

**Retires at M5:** `/practice`, `/practice/[mode]/[category]`, `home-screen.tsx`, mode tabs,
the `CATEGORY_ART` card grid.

**Kept and repointed — this is most of the value:**

| Asset | New job |
|---|---|
| `src/lib/speech/` + `similarity.ts` | Unchanged. The promise is spoken through the same `SpeechVerifier`. |
| `PracticeScreen` speaking core | Extract mic/typing/word-highlight/success into `<SpeakTheLine>`; `/pact` renders it. |
| `src/lib/journeys.ts` | `DAY_SAMPLES`, `arcIndexForDay`, `nextDay`, advance-only progress — survive, keyed by arc id instead of `mode/category`. |
| `stars.ts` `streak.ts` `sessions.ts` `sync.ts` | Untouched. localStorage stays the UI's source of truth. |
| `auth/google.ts`, `useSession`, `analytics.ts` | Untouched. |

### Where the login wall goes

`docs/PLAN.md` says *"no login wall before the magic moment"*, but portrait generation costs
money per user. Gate on **cost**, not on entry:

- `/` runs the self-playing demo with a pre-baked persona. Zero AI cost, full mechanic, no
  sign-in — and it doubles as the short-form video asset `docs/PLAN.md` asks for.
- Tuning and the text conversation run anonymously (cheap, text-only).
- Sign-in is required only to **bring them into focus** — the portrait. The gate lands exactly
  where desire peaks and reads as narrative, not friction.

### Generation is a job row, never a request

`/api/subscribe` is an unauthenticated, unrate-limited POST and is **the wrong template to
copy** — cloning it for generation builds an open endpoint that spends money. Every
generation: authenticated POST → insert `generation_jobs` row → return id → client polls
`GET /api/portal/job/[id]` while the portal plays its "finding them" sequence. The wait is the
theatre. Routes set `export const maxDuration`; Vercel defaults will not survive image
generation.

### Auth on server routes

No server-readable session exists (supabase-js keeps the JWT in localStorage; no middleware, no
`@supabase/ssr`). Copy the **`/api/account/delete` pattern**: client sends
`Authorization: Bearer <access_token>`, route verifies with `admin.auth.getUser(token)`.

Add `src/lib/supabase/server.ts` — none exists. It **must** pass `{ db: { schema: "saythiswith" } }`;
server clients do not inherit the browser client's schema pin, and `/api/account/delete`
silently defaults to `public` today.

### Quota

No rate-limit dependency needed: count the caller's `generation_jobs` rows in the last 24h
before enqueuing, reject over the cap. This is the first endpoint in the app that spends real
money per call.

## Data model

New migration `supabase/migrations/0005_portal.sql`, idempotent, matching `0004`'s style.
Applied by hand via `npm run sql` **from the Buffer_Alt repo** — this repo has no Supabase CLI link.

> ⚠️ `0004` ends with `alter default privileges in schema saythiswith grant all on tables to
> anon, authenticated, service_role`. **Every new table is granted ALL to `anon` automatically.**
> `alter table ... enable row level security` on each one is mandatory, not hygiene. Owner-only
> policies on `(select auth.uid()) = user_id`, mirroring the existing tables.

```
future_selves(id, user_id→auth.users cascade, domain, goal, horizon,
              persona jsonb, portrait_url, provider_ref, created_at)
arcs(id, user_id cascade, future_self_id→future_selves, duration int,
     started_at, completed_days jsonb default '[]', status, created_at)
arc_days(id, arc_id→arcs cascade, day_index int, affirmation, success_message)
portal_conversations(id, user_id cascade, future_self_id, transcript jsonb, created_at)
generation_jobs(id, user_id cascade, kind, status, provider, provider_job_id,
                result_url, cost_cents, error, created_at)
  index generation_jobs_user_created_idx (user_id, created_at desc)   -- the quota check
```

`arc_days` finally gives affirmations **stable IDs**. Add a nullable `arc_day_id` to `sessions`
(keep `affirmation` text denormalised for display and analytics continuity) — additive,
non-destructive, and it retires the text-as-primary-key fragility running through `favorites`,
`sessions` and `sync.ts`.

### Storage and the photo policy

Supabase Storage is unused, the free tier is small, has no backups, auto-pauses, and is now the
single point of failure for two apps. Use **Vercel Blob** for portraits; keep only URLs in
Postgres.

**The source selfie is deleted the moment the portrait exists.** The portrait then serves as
the canonical reference for every later generation. Strongest available privacy posture *and* a
marketing line: **we never keep your photo.**

Consequences to honour:
- Explicit consent copy at upload; biometric handling under GDPR.
- `next.config.ts` has no `images` config — add `images.remotePatterns` or `next/image` throws
  on blob URLs.
- **`/api/account/delete` must explicitly delete the user's blobs.** FK cascade never reaches
  object storage; leaving portraits behind after deletion is a privacy failure, and
  `docs/shared-backend.md` requires re-testing deletion after any change here.

## AI providers

### fal — the portrait (MVP)

**Decision (2026-08-15): fal, not Higgsfield, for the MVP.** Reasons, in order of weight:

1. **It is a real production API.** The Higgsfield surface available today is a *claude.ai
   connector*, not a server-callable API — wiring the app to it needs an account-level key and
   endpoint confirmation that doesn't exist yet. fal ships a documented HTTP API and a Node
   client with a **queue + webhook** model that maps exactly onto the `generation_jobs` design
   above: submit, get an id, poll or receive a callback.
2. **Cost.** fal is pay-as-you-go per image with no subscription floor, which matters when the
   owner's Higgsfield credits are nearly spent and there are zero users to amortise them over.
3. **One vendor covers both media.** Image now, video later (the day-21 "you made it" frame),
   without a second integration.

Higgsfield's **Soul 2.0 + Soul-ID** is genuinely the better primitive for *identity consistency
across many generations*, and is worth revisiting once there is revenue — the portrait-as-
canonical-reference policy above keeps that door open.

Model choice needs confirming against fal's live catalog at build time rather than assumed
here; the shortlist is a single-reference identity-preserving image-to-image editor (cheap,
fast, good identity retention from one selfie) with a higher-fidelity editor as the fallback.
Per-user LoRA training is out of scope for MVP — too slow and too expensive per user.

`FAL_KEY` is server-only, never `NEXT_PUBLIC_`.

### The premise animation — code, not generated video

**No Higgsfield trial account is needed for this.** The portal sequence on `/` is built from
CSS and SVG, and that is the better artifact regardless of budget:

- It interleaves with live UI — the affirmation words light up *inside* the sequence. A baked
  video cannot do that.
- It is responsive across mobile and desktop; a video is one aspect ratio.
- A 3–5 MB mp4 on the marketing hero damages LCP on exactly the mobile traffic the GTM plan
  targets.
- It respects `prefers-reduced-motion`.
- It is free to iterate on. Every copy or timing change to a generated video costs credits.

Generated media earns its place in exactly two spots, both later and both cheap on fal: the
pre-baked **demo persona portrait** (one still, swappable via the `portraitSrc` prop already on
`PortalDemo`), and a **social cut** for TikTok/Reels once the aesthetic is settled.

### Claude — conversation and arc generation

`npm i @anthropic-ai/sdk`. `ANTHROPIC_API_KEY` server-only, never `NEXT_PUBLIC_`.

**The conversation** — `claude-opus-5`, `client.messages.stream()`, `output_config: { effort: "low" }`
for turn latency. Leave adaptive thinking on (default on Opus 5); do **not** set
`thinking: {type:"disabled"}` — on this model that can leak `<thinking>` tags into visible
output, and low effort already buys the latency. `temperature`/`top_p` are rejected with a 400
on Opus 5 — steer voice by prompting only. System prompt carries the persona and ends with a
`cache_control: { type: "ephemeral" }` breakpoint.

**Arc generation** — `claude-opus-5`, `effort: "high"`, `client.messages.parse()` with
`zodOutputFormat`. The project runs **Zod 4**, so the existing `affirmationSchema` in
`src/lib/content.ts` becomes the output schema directly: structured outputs guarantee exactly
21 well-formed entries, preserving the `.length(21)` contract `journeys.ts` depends on.

The 273 owner-approved journey entries are **not discarded** — they become the few-shot corpus
and style contract (Notice→Act→Become, ≤12 words, first person, no "21 days rewires the
brain"). `src/content/mindset-data.json` becomes `src/content/arc-exemplars.json`, a prompt
asset. Generated arcs are user-private, not shipped content, but the honest-science guardrails
stay in the prompt.

## Design: The Signal

A transmission, not a wormhole. References: a distant radio tuning in, light through deep
water, a long exposure resolving. This is the one place the standing "restrained motion" rule
is broken, and it is broken **only inside the portal surface**.

| State | Visual | Audio |
|---|---|---|
| **Scanning** | Possible lives flicker past in jump-cuts; grain heaviest; hue drifting | Sub-bass drone, slowly rising |
| **Locking** | Concentric rings contract; chromatic aberration peaks on all text | Drone climbs, then a struck-bowl tone with a long tail |
| **Connected** | Everything snaps clean and *still* | Near-silence |

The payoff is the **absence** of motion. Stillness after noise is what sells contact.

**The reveal**: the portrait arrives out of focus and heavily grained, then resolves over
~1.2s. Never a hard cut — the resolve *is* the moment. The grade (vignette, grain, slight
chroma shift) does three jobs at once: reads as a signal arriving, softens uncanny valley, and
honestly signals "rendered", never a clinical before/after.

**Tokens**: the theming system is narrative-agnostic and needs **zero component changes**.
`data-mode` + `--mode-accent`/`--mode-accent-2` already drives every fill, glow, cover, dot,
star and the word highlight. **Keep the attribute name**, swap the value set from modes to life
domains. Renaming to `data-domain` would touch every consumer for no gain.

**Sound**: `src/lib/audio.ts` — volume + mute persisted to localStorage, first-gesture unlock,
and the "sound must never break an interaction" try/catch discipline from `src/lib/sound.ts`
preserved. **The word-chord**: each word that lights up plays the next note of a rising
pentatonic run; completing the affirmation resolves the chord. Pure Web Audio oscillators — no
assets, no download cost. Silence is load-bearing: when it is your turn to speak, the bed drops
out entirely.

**Type**: Bricolage Grotesque keeps the affirmation. The future self's dialogue uses the same
face, smaller and letterspaced, so it reads as *voice* rather than UI text.

## Milestones

- [x] **P3-M1 — The Signal, the ritual + demo.** Domain tokens, `.portal-field`, `.verse-flicker`, grain,
      transmission grade, `.resolving`, **global `prefers-reduced-motion` block** (the codebase
      had none — a motion-heavy portal makes that a defect, not a nice-to-have),
      `src/lib/audio.ts` with the word-chord, self-playing `PortalDemo` on `/`, home copy
      reframed, 14-day duration retired, and the threshold ritual (doorway in, return out with
      the line). *Ships alone, costs nothing, proves the aesthetic.* **Live on production
      2026-08-15.**
- [ ] **P3-M0 — Foundations.** `src/lib/supabase/server.ts` (schema-pinned); `0005_portal.sql`
      with RLS on every table; Vercel Blob; `generation_jobs` + quota helper; `maxDuration`;
      `images.remotePatterns`; refresh the stale `.env.example` (missing
      `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, PostHog, site URL — add `ANTHROPIC_API_KEY` and `FAL_KEY`).
- [ ] **P3-M2 — Tune → reveal.** Coordinates form; consent + selfie upload; fal portrait job;
      source-selfie deletion; polling against the scanning sequence; the resolve. Repoint the
      home CTA from `/practice` to `/portal`.
- [ ] **P3-M3 — The conversation.** Streaming Claude persona; transcript ending in a promise;
      handoff into `<SpeakTheLine>` — words light up, stars/streak/session recording all fire
      through the existing untouched path.
- [ ] **P3-M4 — The pact.** Arc generation via structured outputs; `arcs`/`arc_days`; `/pact`
      daily call; `journeys.ts` repointed to arc ids; sync extended.
- [ ] **P3-M5 — Cutover.** Retire `/practice` routes and `home-screen.tsx`; `mindset-data.json`
      → `arc-exemplars.json`; rewrite `/science` on future-self continuity (lead with the age-progressed rendering
      work — it is the licence for the photo feature), episodic future thinking, mental
      contrasting and commitment devices;
      **extend `/api/account/delete` to purge blobs**; rewrite the Playwright smoke test for the
      portal path.

M1 shipped before M0 deliberately: it has no backend dependency, so the aesthetic can be
reviewed on a preview URL while the schema and provider keys are still being sorted.

## Rollback

The pre-revamp production build is preserved three ways. `main` is untouched and still serving
production until an explicit merge.

| Lever | How |
|---|---|
| Git tag | `v1-pre-portal` — pushed to origin. `git checkout v1-pre-portal` |
| Git branch | `pre-portal-snapshot` — pushed to origin, deployable as-is |
| Vercel | Deployments → the last pre-revamp build → **Promote to Production** (instant, no rebuild) |

Work happens on `phase-3-portal`, which gets its own Vercel preview URL. Nothing reaches
production without a merge to `main`.

To abandon the revamp entirely: `git checkout main` and delete the branch. To roll back *after*
a merge: promote the pre-revamp deployment in Vercel first (instant), then
`git revert` the merge commit at leisure.

## Verification

- `npm run build` (includes typecheck) and `npm run lint` before every push.
- `npm run test:e2e` — **check nothing else is on port 3000 first.** `playwright.config.ts`
  sets `reuseExistingServer: true`, so it will silently run against a different app and report
  a meaningless result. This exact failure burned the 2026-08-11 session.
- **Portal end to end on localhost** (mic needs a secure context): tune → job polls → portrait
  resolves → conversation → promise → words light up → session row lands in
  `saythiswith.sessions`.
- **RLS proof:** sign in as a second Google account, attempt to read the first account's
  `future_selves` and `arcs` rows via the browser client. Must return empty. Given the `anon`
  default-grant, verify explicitly rather than assuming.
- **Deletion proof:** create a future self with a portrait, delete the account, confirm both the
  Postgres rows *and* the blob are gone.
- **Quota proof:** exceed the daily cap and confirm a clean rejection with no provider call made.
- **Reduced motion:** run the portal with the OS setting on; confirm no drift, no flicker, no
  aberration pulse, static reveal.

## Open items for the owner

1. **Daily generation cap per user** — drives cost exposure. Suggest starting at 3/day.
2. **Domain set** — `body` / `craft` / `wealth` / `calm` / `connection` is implemented as tokens
   in `globals.css`; the set defines the palette and the persona prompts. Confirm or change
   before M2 wires it to real content.
3. **Arc review before day 1** — show the generated 21 days for approval, or start immediately
   and let them unfold? Approval fits the owner's content-control instinct; unfolding is more
   magical.
4. **Personalisation depth (owner raised 2026-08-15, future).** Beyond the portrait: arcs
   written from the user's own stated goal and turning point, the future self remembering prior
   conversations, and time-of-day/streak-aware lines. The `portal_conversations` transcript and
   `arc_days` tables above are the substrate — designed for it now, built after MVP retention
   data exists.
5. **Spoken future self** — decision 3 puts voice after text. Provider unchosen.
6. ~~How far to take the threshold ritual~~ — **resolved 2026-08-15**: both. Shipped in the
   demo; the spine above governs `/portal` and `/pact`. See "The ritual spine".
7. **The demo persona line is placeholder copy** and now follows the mental-contrasting rule
   ("I still felt like putting it off. I said this out loud and started anyway."). It is
   marketing copy written in this session, not owner-approved content — worth a read before it
   sits in front of paid traffic.
