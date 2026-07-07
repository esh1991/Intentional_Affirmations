# Journeys — 7/14/21-day commitment arcs

*Spec agreed 2026-07-07 (pulled forward from PLAN.md Phase 3). Status: **content-first** — the feature does not ship until progressive per-day content exists and is approved by the owner.*

## Decisions (owner-approved)

- **Duration**: user picks 7 / 14 / 21 days when starting a journey on a category card.
- **Missed days**: advance-only. Dots never reset; a missed day just doesn't advance. The streak (separate mechanic) remains the daily pressure.
- **Progress dots**: on each card, laid in **rows of 7** (21-day = 3 weekly rows). A dot lights when that day's affirmation is completed (verified speech or typed).
- **Visuals**: layered — outline SVG illustrations per category now (`src/components/illustrations.tsx`), richer generated imagery can replace journey covers later.
- **Science framing**: never claim "21 days rewires a neuron" (Maltz myth; Lally 2009 median is ~66 days). Frame as *"a 21-day practice window to build momentum."* The science page may address this honestly — credibility is the brand.

## Content model

Each category gets **one 21-entry progressive arc** in three phases:

1. **Days 1–7 — Notice** (awareness, interrupting the pattern)
2. **Days 8–14 — Act** (deliberate choices, small wins)
3. **Days 15–21 — Become** (identity-level statements)

Shorter journeys sample the same arc so every duration ends at identity:
- **7-day**: days 1, 4, 7, 10, 14, 18, 21
- **14-day**: days 1–3, 5, 7–9, 11, 13–15, 17, 19, 21

Affirmations must stay speakable: ≤ 12 words, concrete, first person.

## Storage (Phase 1 = localStorage; Phase 2 = Supabase `journeys` table)

```
mindsetEngineJourneys = {
  "<mode>/<category name>": {
    duration: 7 | 14 | 21,
    startedAt: "<toDateString()>",
    completedDays: ["<toDateString()>", ...]   // one entry max per day
  }
}
```

Day N of a journey = `completedDays.length + 1`. Completing the day's affirmation appends today (if absent), lights dot N, and also feeds the existing streak/stars.

## Sample arc for approval — "Mindless Scrolling" (Break It)

*Approve/edit this voice before I draft the remaining 12 categories.*

| Day | Affirmation | Success message |
|---|---|---|
| 1 | I notice when my thumb starts to wander. | Awareness is the first win. You caught it. |
| 2 | I pause before I pick up my phone. | That pause is where your power lives. |
| 3 | I am allowed to be bored sometimes. | Boredom is where ideas are born. |
| 4 | I put my phone down without finishing the feed. | You proved the feed doesn't own you. |
| 5 | I choose one real thing over the scroll. | The real world felt that. |
| 6 | My attention is mine and I spend it on purpose. | Spent like it matters — because it does. |
| 7 | One week in, I control the reflex. | Seven days of showing up. Feel that. |
| 8 | I start my morning without a screen. | You gave the morning back to yourself. |
| 9 | I leave my phone in another room when I work. | Distance creates freedom. |
| 10 | I scroll with intention or not at all. | Intention turns habit into choice. |
| 11 | I am present with the people in front of me. | They noticed. Presence shows. |
| 12 | I trade ten scrolled minutes for ten lived ones. | Ten minutes of real life, banked. |
| 13 | I end my day with a book, not a feed. | Your mind will thank you at sunrise. |
| 14 | Two weeks strong, my focus is coming home. | Fourteen days. The fog is lifting. |
| 15 | I am no longer someone who scrolls on autopilot. | That identity is yours now. |
| 16 | My mind creates more than it consumes. | Creator mode: engaged. |
| 17 | I protect my attention like it is my future. | Because it is — and you're proving it. |
| 18 | Stillness feels natural to me now. | You've made peace with the quiet. |
| 19 | I choose depth over distraction. | Deep beats shallow, every time. |
| 20 | My phone is a tool and I am the one holding it. | Exactly right. Tools serve you. |
| 21 | I am present, focused, and free. | Twenty-one days. This is who you are now. |

## Build order (after content approval)

1. Extend `content.ts` schema: `journey: Affirmation[]` (21 entries) per category, validated at build.
2. `src/lib/journeys.ts`: read/start/complete + duration sampling.
3. Card UI: duration picker on first tap ("How long do you want to commit?"), dots row(s) on cards + practice win screen.
4. New habit-flavored categories (e.g. drink water regularly — `WaterGlassArt` illustration already exists) once the mechanic proves out.
