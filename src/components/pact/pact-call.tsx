"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { content } from "@/lib/content";
import { DOMAINS, parseCoordinates, readCoordinatesRaw } from "@/lib/portal/domains";
import {
  JOURNEY_DURATIONS,
  type JourneyState,
  arcIndexForDay,
  arcKey,
  completeJourneyDayAt,
  isCompletedToday,
  isFinished,
  journeyKey,
  nextDay,
  parseJourneys,
  readJourneysRaw,
  startJourneyAt,
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
import { getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { ArcDay } from "@/lib/portal/arc";

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
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  /**
   * The caller's generated arc. `undefined` = not looked up yet, `null` =
   * looked up and there isn't one. Distinguishing the two keeps the commit
   * screen from flashing the wrong copy while the lookup is in flight.
   */
  const [personal, setPersonal] = useState<
    { id: string; days: Array<ArcDay & { id?: string }> } | null | undefined
  >(undefined);
  const { session, loading: sessionLoading } = useSession();
  const raw = rawOverride ?? rawFromStorage;

  // Look for a generated arc once we know who is asking.
  useEffect(() => {
    if (sessionLoading) return;
    let cancelled = false;
    // Every setState lives inside the async callback: a direct setState in the
    // effect body is what the React Compiler lint rejects.
    void (async () => {
      const supabase = session ? getSupabase() : null;
      if (!supabase) {
        if (!cancelled) setPersonal(null);
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("no session");
        const res = await fetch("/api/portal/arc/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as {
          arc?: { id: string; days: Array<ArcDay & { id?: string }> } | null;
        };
        if (!cancelled) setPersonal(json.arc ?? null);
      } catch {
        if (!cancelled) setPersonal(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, sessionLoading]);

  /**
   * Today's arc, and the storage key its progress lives under.
   *
   * A generated arc wins when the caller has one. Otherwise this falls back to
   * the owner-approved library arc via the domain's bridge mode — which is what
   * keeps the daily call working for someone who never signed in.
   */
  const arc = useMemo(() => {
    if (!coords) return null;
    if (personal) {
      return {
        key: arcKey(personal.id),
        arcId: personal.id,
        source: "generated" as const,
        mode: DOMAINS[coords.domain].bridgeMode,
        categoryName: "",
        journey: personal.days,
        items: personal.days,
      };
    }
    if (personal === undefined) return null; // still looking
    const mode = DOMAINS[coords.domain].bridgeMode;
    const category = content[mode].categories[0];
    return {
      key: journeyKey(mode, category.name),
      arcId: null as string | null,
      source: "library" as const,
      mode,
      categoryName: category.name,
      journey: category.journey ?? null,
      items: category.items,
    };
  }, [coords, personal]);

  const state: JourneyState | null | undefined = useMemo(() => {
    if (!arc) return null;
    if (raw === null) return undefined;
    return parseJourneys(raw)[arc.key] ?? null;
  }, [arc, raw]);

  const begin = useCallback(
    async (duration: 7 | 21) => {
      if (!arc || !coords) return;
      playClick();
      setGenError(null);

      // Signed in with no arc yet: this is the moment to write one. They have
      // just committed to a duration, which is what justifies the spend.
      const supabase = getSupabase();
      if (session && !personal && supabase) {
        setGenerating(true);
        try {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          if (!token) throw new Error("no session");
          const res = await fetch("/api/portal/arc", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              domain: coords.domain,
              goal: coords.goal,
              horizon: coords.horizon,
            }),
          });
          const json = (await res.json()) as {
            arcId?: string;
            days?: ArcDay[];
            error?: string;
          };
          if (!res.ok || !json.arcId || !json.days) {
            throw new Error(json.error ?? "Couldn't write your arc.");
          }
          setPersonal({ id: json.arcId, days: json.days });
          setRawOverride(startJourneyAt(arcKey(json.arcId), duration));
          trackEvent("pact_started", { duration, source: "generated" });
          setGenerating(false);
          return;
        } catch (e) {
          // Falling through to the approved library arc is the right failure
          // mode: a generation outage must never block the daily practice.
          setGenError(
            e instanceof Error ? e.message : "Couldn't write your arc.",
          );
          setGenerating(false);
        }
      }

      setRawOverride(startJourneyAt(arc.key, duration));
      trackEvent("pact_started", { duration, source: arc.source });
    },
    [arc, coords, session, personal],
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
      setRawOverride(completeJourneyDayAt(arc.key));
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
        ...(arc.arcId
          ? {
              arcId: arc.arcId,
              ...((line as { id?: string }).id
                ? { arcDayId: (line as { id?: string }).id }
                : {}),
            }
          : {}),
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

  // Generating: the wait is the theatre, same as the portal's scan.
  if (generating) {
    return (
      <Frame domain={domainKey}>
        <p className="aberrating text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Writing your twenty-one days&hellip;
        </p>
        <p className="mt-6 max-w-sm text-pretty text-center text-muted-foreground">
          They only get to send one line a day, so they are choosing them
          carefully. This takes about half a minute.
        </p>
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
        {genError ? (
          <p className="mt-6 max-w-sm text-pretty text-center text-sm text-mode-2" aria-live="polite">
            {genError} We&apos;ll use an approved arc for now — your practice
            isn&apos;t blocked.
          </p>
        ) : null}
        <div className="mt-10 grid w-full max-w-lg gap-4 sm:grid-cols-2">
          {JOURNEY_DURATIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => void begin(duration)}
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
              {arc.source === "generated"
                ? "Written for you alone"
                : "One line is cleared to send"}
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
