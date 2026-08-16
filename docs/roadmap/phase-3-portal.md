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
10. **The guide is under restriction** — they may send instructions, never outcomes. Replaces
    "say it with them" with a read-back handshake. See the section below.
11. **Real generated imagery on the marketing demo, and no card around it.** One generated
    identity carried across five lives, plus a generated doorway; the demo bleeds into the page
    as a full-width night surface instead of sitting in a bordered box.
9. **Quantum Jumping is the lineage, not the label.** Take Goldman's threshold ritual and
   alter-ego framing; refuse the name, the physics and the skill-download claim. Anchor the
   science on future-self continuity instead. See the two sections below.

## Decision 10: the guide is under restriction

*Owner reframe, 2026-08-15: move off "say it with them" — the future self should act as a guide.
The owner supplied the constraint: "the space/time governing body won't allow those details."*

**The restriction is the product, not set dressing.** It does three jobs at once:

1. **It makes the app structurally honest.** We genuinely cannot know anyone's future. If the
   guide is *forbidden* from specifics, the fiction and the truth are the same shape — the app
   never has to fabricate a prophecy, because prophecy is against the rules.
2. **It enforces mental contrasting for free.** The finding that most threatens this app is that
   positive fantasy alone drains effort. A guide who *cannot* show you the trophy, the money or
   the applause is structurally incapable of serving that fantasy. All they can hand over is an
   action. The censorship enforces the science.
3. **It gives them a voice.** A guide operating under restriction speaks in a specific, wry,
   elliptical register. That is a character, not a fortune cookie — and it is far easier to
   write consistently than generic encouragement.

### Why you still speak out loud

The old framing made the future self a chant partner ("say it with them"), which is not what a
guide does. The replacement is stronger: **they send an instruction, and you read it back to
confirm it arrived.** That is literal radio and aviation read-back procedure — and it means the
word-for-word verification already built stops being a gimmick and becomes the handshake. The
mechanic is unchanged; the reason for it is much better.

The product name survives intact: "say this with me" is what a *coach* says. The guide is the
"me".

### Rules

- **Never name the authority.** No agency, no acronym, no lore. "Those are not the rules" and
  "they will not let me send that" carry it. A named body invites lore bloat, drifts toward
  existing franchises, and moves attention off the user.
- **Redaction is shown, not described** — a struck block, never a blur. Blur reads as "loading";
  a bar reads as "withheld". Use it sparingly: one per conversation, not per sentence.
- **What they are cleared to send is always an action**, never an outcome.
- The existing Notice→Act→Become arcs survive the reframe unchanged — they are already
  first-person instructions, which is exactly what a guide would send.

### Open: trust as progression

The natural retention mechanic is that they are cleared to tell you *more* the longer you keep
showing up. It is honest as long as the unlocks deepen guidance rather than reveal outcomes —
they can never give specifics, so there is nothing to falsely promise. Not built; flagged.

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
- [x] **P3-M0 — Foundations.** Shipped 2026-08-15, code side complete:
      - `src/lib/supabase/server.ts` — schema-pinned admin client + `requireUser()`. Server
        clients do **not** inherit the browser client's pin, so a fresh `createClient()` silently
        talks to `public`, which is now First 100's territory.
      - `supabase/migrations/0005_portal.sql` — five tables + `sessions.arc_day_id`, RLS enabled
        on every one. **Not yet applied** (owner action, below).
      - `src/lib/portal/jobs.ts` — job rows + the 24h quota check, failing closed.
      - `src/lib/portal/blob.ts` — Vercel Blob storage and `deleteUserBlobs()`.
      - `/api/account/delete` rewritten onto `requireUser()` and now purges blobs **before**
        deleting the auth user.
      - `next.config.ts` `images.remotePatterns` for the blob host (`domains` is gone in Next 16).
      - `.env.example` refreshed — it was missing `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, PostHog and the
        site URL entirely; now also carries `BLOB_READ_WRITE_TOKEN`, `FAL_KEY`, `ANTHROPIC_API_KEY`.

      `maxDuration` is deliberately **not** set yet: it belongs on the generation routes, which
      arrive in M2. Setting it on routes that make no provider call would be noise.
- [x] **P3-M2 — Tune → reveal.** Complete 2026-08-15.
      - `/portal` live: tune (domain → goal → horizon, anonymous, localStorage) → cross → scan →
        contact → the one line they are cleared to send → hand-off into the speaking flow.
      - `src/lib/portal/domains.ts` — the five life domains, each with a `bridgeMode` pointing at
        the closest owner-approved mode until generated arcs land in M4.
      - `src/lib/portal/guide.ts` — the guide's message per domain, obeying decision 10 (name the
        obstacle, hand over an action, never the outcome, never name the authority). The
        *promise* itself is pulled from the owner-approved library, not invented.
      - Home CTA repointed to `/portal`.

      **Portrait generation shipped 2026-08-15 and verified end to end.** `fal-ai/nano-banana/edit`
      via `src/lib/portal/portrait.ts` + `POST /api/portal/portrait`. Measured: identity
      preserved from a single reference, ~8s, data-URI input accepted. Portraits are stored as
      **private** blobs and read back through `GET /api/portal/portrait/[id]`, which
      authenticates and checks ownership before streaming — not a presigned URL, which needs a
      two-step token delegation and would hand out a bearer credential that outlives the request.
      **Consent + upload shipped 2026-08-15** — `src/components/portal/bring-into-focus.tsx`,
      offered right after the guide speaks (where wanting to see the face is strongest) and
      always skippable. Sign-in gates only this step; tuning and contact stay anonymous.

      Two things worth not re-deriving: the consent copy **names the third-party provider**,
      because "we never keep your photo" is true of our storage and misleading on its own; and
      `<img src>` cannot carry an `Authorization` header, so a private portrait is fetched with
      the bearer token and handed to the tag as an object URL (revoked on unmount) rather than
      served through `next/image`, which would re-request it without the header.

      **Built to work without a portrait on purpose.** The reveal is the hook; the rep is the
      product — a portal that stops at the portrait is the exact failure mental-contrasting
      research describes. The portrait slot is reserved and lights up on a `src` swap once
      `FAL_KEY` + the blob store exist. Still to do: consent + selfie upload, the fal job,
      source-selfie deletion, polling against the scan.
- [x] **P3-M3a — `<SpeakTheLine>` extracted.** The mic, typing fallback and word highlighting
      now live in `src/components/app/speak-the-line.tsx`, shared by `/practice` and `/pact`.
      It owns the mechanic and deliberately owns *nothing* about what success means — stars,
      streaks, journeys and session logging stay with each caller, because the two surfaces
      reward completion differently. `practice-screen.tsx` dropped 665 → 490 lines with no
      behaviour change (the smoke test drives a full typed completion and still passes).
      **Callers must pass `key={affirmation}`**: resetting state from an effect is what the
      React Compiler lint forbids, and remount-on-key is the correct pattern anyway.
- [x] **P3-M3 — The conversation.** Shipped 2026-08-15.
      - `src/lib/portal/conversation.ts` + `POST /api/portal/conversation`: streaming
        `claude-opus-5` at `effort: "low"` (latency is the felt quality on a conversational
        turn), persona cached from the second turn on. Transcript persisted to
        `portal_conversations` fire-and-forget — failing to store it must never break the reply
        being read.
      - **Verified the restriction holds under pressure**, which is the whole conceit. Probed
        with "does it get finished, yes or no" → *"No. Not that — those are not the rules"*;
        "how many copies, give me the number" → *"That is not mine to give"*; "what do I do
        tomorrow" → a concrete action. It refuses outcomes and pays out in actions.
      - Sits **after** the portrait step so there is only ever one account ask per journey;
        signed-out visitors pass straight through rather than meeting a second gate.
      - Five turns per call. Scarcity is the product — a guide who answers forever is a chatbot.

      ⚠️ **Deviation from the plan, deliberate:** the spec said the conversation runs
      anonymously because it is "cheap, text-only". It requires sign-in instead. An
      unauthenticated endpoint that calls an LLM is an open money faucet on a public URL, and
      there is no anonymous identity to meter, so there is nothing to rate-limit against.
      Making it anonymous *safely* needs an anon-usage store (hashed IP + counter table) — a
      migration and an owner action. Revisit if the anonymous experience matters.

- [ ] ~~**P3-M3 — The conversation.**~~ Streaming Claude persona; transcript ending in a promise;
      handoff into `<SpeakTheLine>` — words light up, stars/streak/session recording all fire
      through the existing untouched path.
- [~] **P3-M4 — The pact.** `/pact` shipped 2026-08-15; generated arcs still to come.
      - `/pact` is the daily call and the portal now hands off to it instead of the old browse
        hub — the commitment picker (7 or 21) moved here, which is where it belongs.
      - **The reward lands on the way back out**, not at verification: stars, streak and dots all
        resolve on the return screen, which is what makes the ritual close rather than stop.
      - Content is still the owner-approved arc via the domain's `bridgeMode`. Swapping in
        generated `arcs`/`arc_days` changes one memo in `pact-call.tsx` and nothing else.
      - **Arc generation shipped 2026-08-15 and verified against the live API.** `src/lib/portal/arc.ts`
        + `POST /api/portal/arc`: `claude-opus-5`, `effort: "high"`, structured outputs via
        `messages.parse()` + `zodOutputFormat`. Two owner-approved arcs ride in a
        `cache_control` prefix as the style contract, so generated arcs inherit the voice.
        Measured: 21/21 days, all ≤12 words, correct Notice→Act→Become progression, no
        banned-claim hits, ~27s at effort high.
      - **`/pact` now serves the generated arc** (2026-08-15). `GET /api/portal/arc/latest`
        returns the caller's active arc; the pact uses it when there is one and falls back to
        the owner-approved library arc otherwise — which is what keeps the daily call working
        for someone who never signed in. Generation fires when they **commit to a duration**,
        because that commitment is what justifies the spend, and the ~27s wait is presented as
        the guide writing rather than a hung button.
      - `journeys.ts` gained a key-based API (`arcKey`, `startJourneyAt`, `completeJourneyDayAt`).
        The mode/category functions remain as thin wrappers, so `/practice` is untouched.
      - **A generation outage falls back to the library arc rather than blocking.** Practice must
        never depend on a third-party API being up.
      - **Sync extended to cloud arcs 2026-08-15.** `syncNow` pulls `arcs` and merges progress
        under the `arc/<id>` key; pushes are **partitioned by key kind** — generated arcs go to
        `arcs`, library journeys to `journeys`. This fixed a latent bug: the old push split
        every key on `/` and upserted it into `journeys`, so an `arc/<uuid>` key would have
        written `mode: "arc"` with a uuid as the category, then synced back down as a phantom
        journey. `syncCompletion` routes the same way, and `sessions.arc_day_id` is finally
        populated — the stable pointer the migration added.
- [x] **P3-M5 — Cutover.** Built 2026-08-15 on `p3-m5-cutover`, held for owner preview because
      it deletes routes.
      - Retired `/practice`, `/practice/[mode]/[category]`, `home-screen.tsx`,
        `practice-screen.tsx`. `<SpeakTheLine>` had already been extracted, so `/pact` was
        unaffected.
      - Redirects added for `/practice`, `/practice/:path*` and `/?mode=` so old shares, an
        installed PWA's `start_url`, and bookmarks land on the portal rather than a 404.
      - Home page now sells the **five life domains**, not the four modes. Header, footer,
        welcome-back, sign-in redirect and manifest all repointed.
      - **Two honest-science violations found and fixed in shipped copy** — see below.

      ⚠️ **Deviation:** `mindset-data.json` was NOT renamed to `arc-exemplars.json`. It now does
      two jobs — the few-shot corpus for arc generation *and* the fallback arc a signed-out
      visitor practises. Renaming it "exemplars" would misname half of what it does.

- [ ] ~~**P3-M5 — Cutover.**~~ Retire `/practice` routes and `home-screen.tsx`; `mindset-data.json`
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

## Blocked on the owner (M0 → M2 handoff)

Code-side M0 is done; three things need the owner before M2 can be wired:

1. **Apply `0005_portal.sql`.** From the Buffer_Alt repo:
   `npm run sql ../saythiswithme/supabase/migrations/0005_portal.sql`. This repo has no Supabase
   CLI link. Then run the **RLS proof** below — given 0004's blanket `anon` grant, verify rather
   than assume.
2. **Create a Vercel Blob store** and attach it to the project. `BLOB_READ_WRITE_TOKEN` is then
   injected automatically; it is only set by hand for local dev.
3. **`FAL_KEY`** from a fal account. Nothing photoreal can be generated without it.

**All three landed 2026-08-15** — migration applied and verified (RLS proven against anon),
blob store created (private access + read-write token), keys set in Vercel.

## Honest-science violations found in shipped copy (M5)

Both were live on production and both said the exact thing the brand rule exists to prevent —
and the thing the arc-generation prompt blocks in *generated* content. Fixed on correctness
grounds, not taste.

1. **`/science` led with** *"Neuroplasticity: your brain is rewireable — you consistently speak
   a new thought and physically build a new, stronger path."* Rewritten around future-self
   continuity (Hershfield), episodic future thinking (Peters & Büchel), mental contrasting
   (Oettingen — presented as the finding that argues *against* a naive version of this app),
   spoken self-affirmation (Cascio), and the backfire finding (Wood) kept as its own section.
2. **Root site metadata**, on every page and in every search result, promised to *"rewire your
   brain"* and to *"speak your future into existence"*, and sold a "4-in-1 tool" that no longer
   exists.

Worth a standing check: the guardrails were being enforced on model output while the
hand-written marketing copy quietly broke them.

## API facts worth not re-deriving

Checked against the live API 2026-08-15, because several differ from what the spec assumed:

- **`usage.input_tokens` is the uncached remainder only.** With the exemplar prefix cached it
  reads ~84 tokens for a ~2k-token prompt. Total prompt = `input_tokens` +
  `cache_creation_input_tokens` + `cache_read_input_tokens`. Costing off `input_tokens` alone
  under-reports by more than an order of magnitude.
- **Structured outputs do not enforce array length.** `.length(21)` is stripped from the schema
  sent to the API and validated client-side by the SDK instead — which is the behaviour we
  want (fail loudly), but it is not an API guarantee.
- **Thinking is on by default on `claude-opus-5`**, and `max_tokens` caps thinking *plus*
  visible output. Sizing `max_tokens` to the visible arc would truncate it.
- **Opus 5's minimum cacheable prefix is 512 tokens** (down from 1024 on Opus 4.8).
- **fal accepts a `data:` URI in `image_urls`.** This is what makes the photo policy possible —
  the selfie never needs a fetchable home, so it is never written to any bucket of ours.
- **`@vercel/blob`'s `presignUrl` requires a two-step token delegation** (`issueSignedToken`
  first). For owner-only reads, `get(pathname, {access:"private"})` streamed through an
  authenticated route is simpler and tighter.
- **Next 16 route handlers receive `params` as a `Promise`** — `const { id } = await params`.
- `temperature` / `top_p` / `top_k` return a 400 on Opus 5 — steer by prompting only.

## Gamification (Phase 3b)

Design rationale in the session that proposed it; the principle is that the premise generates a
better version of every standard mechanic, so nothing here is bolted on.

- [x] **The Log** (`/log`, shipped 2026-08-15). Every line ever sent, grouped by day, with the
      spoken/typed marker. Near-free to build because `sessions` has recorded completions since
      Phase 1 — the value was sitting there unread. Reads localStorage first so it works signed
      out, then merges the caller's cloud rows so it is whole across devices.
- [x] **Clearance** (`src/lib/portal/clearance.ts`, shipped 2026-08-16). Four levels earned by
      **distinct days practised** — eight lines in one sitting is one day, because showing up is
      the thing being rewarded.

      | | Level | Days | What actually changes |
      |---|---|---|---|
      | 1 | Contact | 0 | 3 questions per call |
      | 2 | Open channel | 3 | 5 questions |
      | 3 | They remember | 7 | 8 questions, **and the guide is shown your recent lines** |
      | 4 | Off protocol | 21 | 12 questions |

      Two rules held: **every level changes what actually happens** (a level that only prints a
      nicer word is the bolted-on gamification this design exists to avoid), and **no level
      lifts the restriction** — clearance deepens guidance, never reveals outcomes, so it stays
      inside decision 10 and has nothing to falsely promise.

      **Enforced server-side**, computed from `sessions` in the route. A client-supplied level
      would be a free upgrade for anyone who edits a fetch. The panel computes the same value
      locally for UI only; the route is the authority and returns 400 on a mismatch.

      Level 3 is the personalisation substrate: recent lines are injected into the guide's
      system prompt, so "they remember" is a real capability gate rather than a label.
- [x] **Signal strength** (`src/lib/portal/signal.ts`, shipped 2026-08-16). Days since the last
      line drive one CSS token, `--signal-noise` (0 → 1), so the whole surface degrades together:
      clear (0–1 days) → drifting (2–3) → faint (4–6) → lost (7+).

      Three constraints, all enforced and covered by e2e:
      - **Fully reversible.** One completed line restores it from any state, and it clears on
        the return screen immediately rather than next visit.
      - **Never blocks anything.** Degradation is atmosphere plus one line of copy. Nothing is
        hidden, gated, or made unreadable — the test asserts the page stays fully usable at
        maximum noise, because that is the state someone returning after weeks away arrives in.
      - **Never scolds.** The copy is an invitation ("They're still on the line — say one and it
        clears"), never a count of their absence. This is a mental-health-adjacent product and
        "streak lost" is the wrong instrument.

      A first-ever visitor reads as *clear*, not lost — they have not drifted from anything.
- [x] **Breaking protocol** (`src/lib/portal/protocol.ts`, shipped 2026-08-16). Occasionally the
      return screen carries a message they should not have sent. Measured: ~1 in 8 completions,
      rising to ~1 in 3 at Clearance 4 (the level literally named "Off protocol").

      Three rules, all verified:
      - **Still no outcomes.** Breaking protocol never means breaking decision 10. Every line is
        about the present, memory, or how they feel. Scanned the pool against prediction,
        certainty and mechanism patterns: zero hits. A message that leaked a prediction would
        undo the premise for a cheap thrill.
      - **Deterministic, not random.** Selected from a hash of `affirmation@@completedAt`, so the
        same completion always yields the same result — it cannot be re-rolled by refreshing,
        and it keeps `Math.random` out of render (React Compiler lint).
      - **Pre-written, not generated.** An LLM call on the win screen would add cost and latency
        to the single most important moment in the app, to produce something a human writes
        better.

- [ ] **Held frequency.** A banked protected day, earned by consistency, never bought.

**Ruled out, deliberately:** hearts/lives (they would block someone from saying an affirmation,
in a mental-health-adjacent app); leagues and leaderboards (ranking inner work against strangers
is off-brand and risky for exactly the low-self-esteem population the Wood backfire finding
describes); paid streak repair.

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
