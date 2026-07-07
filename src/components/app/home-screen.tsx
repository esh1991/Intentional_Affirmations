"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap, CircleOff, Target, RefreshCw } from "lucide-react";
import type { Content, ModeKey } from "@/lib/content";
import { MODE_KEYS, MODE_META, isModeKey } from "@/lib/content";
import { useClientValue } from "@/hooks/use-client-value";

const MODE_ICONS: Record<ModeKey, typeof Zap> = {
  powerUp: Zap,
  breakIt: CircleOff,
  primeMe: Target,
  rewire: RefreshCw,
};

export function HomeScreen({ content }: { content: Content }) {
  // Honor ?mode= links (e.g. from the science page), like the legacy site.
  // Read client-side so the page stays statically prerendered.
  const urlMode = useClientValue(() =>
    new URLSearchParams(window.location.search).get("mode"),
  );
  const [selectedMode, setSelectedMode] = useState<ModeKey | null>(null);
  const mode =
    selectedMode ?? (urlMode && isModeKey(urlMode) ? urlMode : "powerUp");

  const current = content[mode];

  return (
    <div data-mode={mode} className="relative isolate flex-1">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <main className="mx-auto w-full max-w-6xl px-5 pb-20">
        {/* Hero */}
        <section className="mx-auto max-w-3xl pt-14 text-center sm:pt-20">
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {MODE_META[mode].tagline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Don&apos;t just read affirmations — say them out loud. We verify
            every word as you speak, so the rep actually counts.{" "}
            <Link href="/science" className="text-mode-2 underline-offset-4 hover:underline">
              See the science
            </Link>
            .
          </p>
        </section>

        {/* Mode switcher */}
        <nav
          className="mx-auto mt-10 grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4"
          aria-label="Modes"
        >
          {MODE_KEYS.map((key) => {
            const Icon = MODE_ICONS[key];
            const active = key === mode;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMode(key)}
                aria-pressed={active}
                className={`flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "border-transparent bg-mode text-mode-foreground shadow-lg"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {MODE_META[key].label}
              </button>
            );
          })}
        </nav>

        {/* Category cards */}
        <section className="mt-14">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {current.prompt}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {current.categories.map((category) => {
              const Icon = MODE_ICONS[mode];
              return (
                <Link
                  key={category.name}
                  href={`/practice/${mode}/${encodeURIComponent(category.name)}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-mode/50 hover:shadow-xl"
                >
                  <div className="card-cover relative flex h-36 items-end p-5 sm:h-40">
                    <Icon
                      className="absolute -right-4 -top-4 size-28 text-white/10 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                      aria-hidden
                    />
                    <h3 className="relative text-balance text-xl font-semibold leading-snug text-white">
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-sm text-muted-foreground">
                      {category.items.length} affirmation
                      {category.items.length === 1 ? "" : "s"}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-mode-2">
                      Start
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
