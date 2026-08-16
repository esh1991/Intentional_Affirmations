"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Keyboard, Mic } from "lucide-react";
import { readSessions, type SessionEntry } from "@/lib/sessions";
import { readStreak } from "@/lib/streak";
import { getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useClientValue } from "@/hooks/use-client-value";
import { clearanceFor, nextClearance } from "@/lib/portal/clearance";

/**
 * The log — every line they ever sent you, and the day you said it.
 *
 * This is the investment mechanic: not points, but a record of the work
 * actually done. It costs almost nothing to build because `sessions` has been
 * recording completions since Phase 1; the value was always sitting there
 * unread.
 *
 * Reads localStorage first so it works signed out, then merges the cloud rows
 * for anyone signed in, so the log is whole across devices.
 */

interface LogEntry {
  affirmation: string;
  completedAt: string;
  input: "voice" | "typed";
}

/** Dedupe key: the same completion can arrive from local and cloud. */
function keyOf(e: { affirmation: string; completedAt: string }): string {
  return `${e.affirmation}@@${e.completedAt}`;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(d.getFullYear() === today.getFullYear() ? {} : { year: "numeric" }),
  });
}

export function LogView() {
  const localRaw = useClientValue(() => JSON.stringify(readSessions()));
  const streak = useClientValue(readStreak);
  const { session, loading } = useSession();
  const [cloud, setCloud] = useState<LogEntry[]>([]);

  // Pull the caller's own rows. RLS scopes this to them, and the browser
  // client is already schema-pinned to `saythiswith`.
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    void (async () => {
      const supabase = session ? getSupabase() : null;
      if (!supabase) return;
      const { data, error } = await supabase
        .from("sessions")
        .select("affirmation,input,completed_at")
        .order("completed_at", { ascending: false })
        .limit(500);
      if (error || !data || cancelled) return;
      setCloud(
        data.map((r) => ({
          affirmation: r.affirmation as string,
          completedAt: r.completed_at as string,
          input: (r.input as "voice" | "typed") ?? "voice",
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [session, loading]);

  const { days, total, distinctDays } = useMemo(() => {
    const local: SessionEntry[] = localRaw ? JSON.parse(localRaw) : [];
    const byKey = new Map<string, LogEntry>();
    for (const e of local) {
      byKey.set(keyOf(e), {
        affirmation: e.affirmation,
        completedAt: e.completedAt,
        input: e.input,
      });
    }
    for (const e of cloud) if (!byKey.has(keyOf(e))) byKey.set(keyOf(e), e);

    const all = [...byKey.values()].sort(
      (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
    );

    const grouped = new Map<string, LogEntry[]>();
    for (const e of all) {
      const label = dayLabel(e.completedAt);
      const bucket = grouped.get(label);
      if (bucket) bucket.push(e);
      else grouped.set(label, [e]);
    }
    return {
      days: [...grouped.entries()],
      total: all.length,
      distinctDays: grouped.size,
    };
  }, [localRaw, cloud]);

  // Hydrating.
  if (localRaw === null) return <div className="min-h-96" aria-hidden />;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          The log
        </p>
        <h1 className="font-display mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Nothing has come through yet.
        </h1>
        <p className="mt-4 max-w-md text-pretty text-muted-foreground">
          Every line they send you lands here, with the day you said it out
          loud. Open the channel and it starts filling.
        </p>
        <Link
          href="/portal"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-mode px-8 py-4 text-lg font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          Open the channel
          <ArrowRight className="size-5" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          The log
        </p>
        <h1 className="font-display mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Everything they&apos;ve sent you.
        </h1>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {[
            { n: total, label: total === 1 ? "line said" : "lines said" },
            { n: distinctDays, label: distinctDays === 1 ? "day" : "days" },
            ...(streak ? [{ n: streak, label: "in a row" }] : []),
          ].map((stat) => (
            <span
              key={stat.label}
              className="flex items-baseline gap-2 rounded-full border border-border/60 bg-card/60 px-5 py-2.5"
            >
              <b className="font-display text-xl font-bold tabular-nums text-mode-2">
                {stat.n}
              </b>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </span>
          ))}
        </div>
      </header>

      {/*
        Clearance, shown where it is earned. It reports what has actually
        changed about the channel — not a badge, and never a promise about
        outcomes.
      */}
      {(() => {
        const level = clearanceFor(distinctDays);
        const next = nextClearance(distinctDays);
        const toGo = next ? next.days - distinctDays : 0;
        return (
          <div className="mt-10 rounded-2xl border border-border/60 bg-card/50 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
                Clearance {level.level} &middot; {level.name}
              </p>
              {next ? (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {toGo} more {toGo === 1 ? "day" : "days"} to {next.name}
                </p>
              ) : null}
            </div>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              {level.unlocked}
            </p>
          </div>
        );
      })()}

      <div className="mt-10 flex flex-col gap-10">
        {days.map(([label, entries]) => (
          <section key={label}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {entries.map((e) => (
                <li
                  key={keyOf(e)}
                  className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card/50 px-5 py-4"
                >
                  <span
                    className="mt-1 text-muted-foreground"
                    title={e.input === "typed" ? "Typed" : "Spoken"}
                  >
                    {e.input === "typed" ? (
                      <Keyboard className="size-4" aria-hidden />
                    ) : (
                      <Mic className="size-4" aria-hidden />
                    )}
                    <span className="sr-only">
                      {e.input === "typed" ? "Typed" : "Spoken"}
                    </span>
                  </span>
                  <p className="font-display text-balance text-lg font-semibold leading-snug">
                    {e.affirmation}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {!loading && !session ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          This log lives on this device.{" "}
          <Link href="/signin" className="text-mode-2 underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to keep it when you switch phones.
        </p>
      ) : null}
    </div>
  );
}
