"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { content } from "@/lib/content";
import { DOMAINS, parseCoordinates, readCoordinatesRaw } from "@/lib/portal/domains";
import {
  JOURNEY_DURATIONS,
  type JourneyState,
  arcIndexForDay,
  completeJourneyDay,
  isCompletedToday,
  isFinished,
  journeyKey,
  nextDay,
  parseJourneys,
  readJourneysRaw,
  startJourney,
} from "@/lib/journeys";
import { JourneyDots } from "@/components/app/journey-dots";
import { SpeakTheLine, type SpeakResult } from "@/components/app/speak-the-line";
import { useClientValue } from "@/hooks/use-client-value";
import { addStar } from "@/lib/stars";
import { recordCompletion } from "@/lib/streak";
import { recordSession, type SessionEntry } from "@/lib/sessions";
import { syncCompletion } from "@/lib/sync";
import { trackEvent } from "@/lib/analytics";
import { playClick } from "@/lib/sound";

/**
 * The pact — today's call.
 *
 * The same door every day is what turns a feature into a practice
 * (docs/roadmap/phase-3-portal.md, "The ritual spine"), so this surface never
 * varies: cross, take the one line they are cleared to send, read it back, and
 * leave through the same door carrying it.
 *
 * **The reward lands on the way back out**, not at the moment of verification.
 * Stars, streak and dots all resolve on the return screen, which is what makes
 * the sequence close rather than simply stop.
 *
 * Arcs are still the owner-approved journey content, keyed by the domain's
 * bridge mode; generated per-user arcs replace the source in M4 without
 * changing this component.
 */

const DURATION_LABELS: Record<number, string> = {
  7: "A week to feel it",
  21: "Three weeks to become it",
};

interface Landed {
  day: number;
  duration: number;
  completed: number;
  streak: number;
  stars: number;
  trophy: boolean;
}

/**
 * The door. Identical on every branch below — the ritual only works if the
 * surface never varies. Defined at module scope: a component created during
 * render is a fresh component type each pass, which remounts its children.
 */
function Frame({
  domain,
  children,
}: {
  domain: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-mode={domain}
      className="dark relative mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-foreground"
    >
      <div
        className="portal-night grain pointer-events-none absolute -inset-x-48 -inset-y-24 -z-20"
        aria-hidden
      />
      <div
        className="portal-field pointer-events-none absolute -inset-x-40 -inset-y-16 -z-10"
        aria-hidden
      />
      {children}
    </div>
  );
}

export function PactCall() {
  // Both reads return strings: useSyncExternalStore snapshots must be
  // referentially stable, so parsing happens in a memo, never in the snapshot.
  const coordsRaw = useClientValue(readCoordinatesRaw);
  const rawFromStorage = useClientValue(readJourneysRaw);
  const coords = useMemo(() => parseCoordinates(coordsRaw), [coordsRaw]);
  const [rawOverride, setRawOverride] = useState<string | null>(null);
  const [landed, setLanded] = useState<Landed | null>(null);
  const raw = rawOverride ?? rawFromStorage;

  // Resolve today's arc: domain → bridge mode → that mode's first category.
  // Generated per-user arcs replace this source in M4 without touching the
  // rest of this component.
  const arc = useMemo(() => {
    if (!coords) return null;
    const mode = DOMAINS[coords.domain].bridgeMode;
    const category = content[mode].categories[0];
    return {
      mode,
      categoryName: category.name,
      journey: category.journey ?? null,
      items: category.items,
    };
  }, [coords]);

  const state: JourneyState | null | undefined = useMemo(() => {
    if (!arc) return null;
    if (raw === null) return undefined;
    return parseJourneys(raw)[journeyKey(arc.mode, arc.categoryName)] ?? null;
  }, [arc, raw]);

  const begin = useCallback(
    (duration: 7 | 21) => {
      if (!arc) return;
      playClick();
      setRawOverride(startJourney(arc.mode, arc.categoryName, duration));
      trackEvent("pact_started", { duration, mode: arc.mode });
    },
    [arc],
  );

  const day = state ? nextDay(state) : 1;
  const line =
    arc && state
      ? (arc.journey?.[arcIndexForDay(state.duration, day)] ?? arc.items[0])
      : null;

  const onSuccess = useCallback(
    ({ matchScore, input, attempts }: SpeakResult) => {
      if (!arc || !state || !line) return;
      const streak = recordCompletion();
      const { stars, trophy } = addStar();
      setRawOverride(completeJourneyDay(arc.mode, arc.categoryName));
      const completed = state.completedDays.length + 1;
      const entry: SessionEntry = {
        affirmation: line.affirmation,
        mode: arc.mode,
        category: arc.categoryName,
        matchScore,
        attempts,
        input,
        completedAt: new Date().toISOString(),
        journeyDay: day,
        journeyDuration: state.duration,
      };
      recordSession(entry);
      void syncCompletion(entry);
      trackEvent("affirmation_success", {
        mode: arc.mode,
        category: arc.categoryName,
        match_score: matchScore,
        input,
        surface: "pact",
      });
      setLanded({ day, duration: state.duration, completed, streak, stars, trophy });
      new Audio("/success.mp3").play().catch(() => {});
      if (trophy || completed === state.duration) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      }
    },
    [arc, state, line, day],
  );

  const domainKey = coords?.domain ?? "portal";

  // Hydrating — null means "not read yet", never "absent".
  if (coordsRaw === null || raw === null) {
    return (
      <Frame domain={domainKey}>
        <div className="min-h-64" aria-hidden />
      </Frame>
    );
  }

  // Never tuned — there is no line to send yet.
  if (!coords || !arc) {
    return (
      <Frame domain={domainKey}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          The line is closed
        </p>
        <h1 className="font-display mt-4 text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl">
          You haven&apos;t opened the channel yet.
        </h1>
        <Link
          href="/portal"
          className="mt-8 rounded-full bg-mode px-8 py-4 text-lg font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          Open the channel
        </Link>
      </Frame>
    );
  }

  // First visit after tuning: how long do you want the line open?
  if (state === null) {
    return (
      <Frame domain={domainKey}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Before they start sending
        </p>
        <h1 className="font-display mt-4 text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl">
          How long do you want the line open?
        </h1>
        <p className="mt-4 max-w-md text-pretty text-center text-muted-foreground">
          One line a day, through the same door. Miss a day and nothing resets —
          it just waits for you.
        </p>
        <div className="mt-10 grid w-full max-w-lg gap-4 sm:grid-cols-2">
          {JOURNEY_DURATIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => begin(duration)}
              className="flex flex-col items-center rounded-3xl border border-border/60 bg-card/70 p-6 transition-all hover:-translate-y-1 hover:border-mode/60"
            >
              <span className="font-display text-4xl font-bold text-mode-2">
                {duration}
              </span>
              <span className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                days
              </span>
              <span className="mt-3 text-center text-sm font-medium">
                {DURATION_LABELS[duration]}
              </span>
              <JourneyDots total={duration} completed={0} className="mt-4" />
            </button>
          ))}
        </div>
      </Frame>
    );
  }

  /* ---- The return: where the reward lands ----------------------------- */
  if (landed) {
    const finished = landed.completed >= landed.duration;
    return (
      <Frame domain={domainKey}>
        <Image
          src="/portal/doorway.webp"
          alt=""
          width={604}
          height={900}
          className="doorway-closing h-40 w-auto object-contain mix-blend-screen"
          aria-hidden
        />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Received. Word for word.
        </p>
        <h1 className="font-display mt-4 text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {finished
            ? `That's all ${landed.duration} days.`
            : "Take it into today."}
        </h1>
        <JourneyDots
          total={landed.duration}
          completed={landed.completed}
          className="mt-8"
        />
        <p className="mt-6 text-muted-foreground">
          Day {landed.completed} of {landed.duration} · {landed.streak} day
          {landed.streak === 1 ? "" : "s"} in a row
        </p>
        <p className="font-display mt-10 text-xl font-semibold">
          {finished ? "The line stays open." : "Same door tomorrow."}
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full border border-border bg-card/60 px-7 py-3 font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          Done for today
        </Link>
      </Frame>
    );
  }

  // Already done today, or the arc is finished. `state` is only undefined
  // while hydrating, which returned above; narrow it so TS can follow.
  if (state === undefined) return <Frame domain={domainKey}><div className="min-h-64" aria-hidden /></Frame>;

  if (isCompletedToday(state) || isFinished(state)) {
    const finished = isFinished(state);
    return (
      <Frame domain={domainKey}>
        <JourneyDots total={state.duration} completed={state.completedDays.length} />
        <h1 className="font-display mt-6 text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {finished
            ? `That's all ${state.duration} days.`
            : "Today's line is already in."}
        </h1>
        <p className="mt-4 max-w-md text-pretty text-center text-muted-foreground">
          {finished
            ? "You did the reps. That's not magic — that's practice."
            : "They only send one a day. Come back tomorrow and the door will be here."}
        </p>
        <p className="font-display mt-8 text-xl font-semibold">Same door tomorrow.</p>
        <Link
          href="/"
          className="mt-8 rounded-full border border-border bg-card/60 px-7 py-3 font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          Back home
        </Link>
      </Frame>
    );
  }

  /* ---- Today's line --------------------------------------------------- */
  return (
    <Frame domain={domainKey}>
      <SpeakTheLine
        key={line?.affirmation ?? "none"}
        affirmation={line?.affirmation ?? ""}
        onSuccess={onSuccess}
        chord
        header={
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
              One line is cleared to send
            </span>
            <span className="rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm font-semibold">
              Day {day} of {state.duration}
            </span>
            <JourneyDots
              total={state.duration}
              completed={state.completedDays.length}
            />
          </div>
        }
      />
    </Frame>
  );
}
