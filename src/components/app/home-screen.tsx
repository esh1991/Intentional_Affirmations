"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, CircleOff, Target, RefreshCw } from "lucide-react";
import type { Content, ModeKey } from "@/lib/content";
import { MODE_KEYS, MODE_META, isModeKey } from "@/lib/content";
import { StreakBadge } from "@/components/app/streak-badge";
import { useClientValue } from "@/hooks/use-client-value";

const MODE_ICONS: Record<ModeKey, typeof Zap> = {
  powerUp: Zap,
  breakIt: CircleOff,
  primeMe: Target,
  rewire: RefreshCw,
};

export function HomeScreen({ content }: { content: Content }) {
  // Honor ?mode= links (e.g. from marketing pages), like the legacy site.
  // Read client-side so the page stays statically prerendered.
  const urlMode = useClientValue(() =>
    new URLSearchParams(window.location.search).get("mode"),
  );
  const [selectedMode, setSelectedMode] = useState<ModeKey | null>(null);
  const mode =
    selectedMode ?? (urlMode && isModeKey(urlMode) ? urlMode : "powerUp");

  const current = content[mode];

  return (
    <div data-mode={mode} className="relative isolate flex min-h-dvh flex-col">
      <div className="mode-glow pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <header className="mx-auto flex w-full max-w-md items-center justify-between px-5 pt-6">
        <span className="text-sm font-semibold tracking-wide text-foreground/80">
          Say This With Me
        </span>
        <StreakBadge />
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-12">
        <h1 className="mt-10 text-balance text-3xl font-semibold leading-tight tracking-tight">
          {MODE_META[mode].tagline}
        </h1>

        <nav className="mt-8 grid grid-cols-4 gap-2" aria-label="Modes">
          {MODE_KEYS.map((key) => {
            const Icon = MODE_ICONS[key];
            const active = key === mode;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMode(key)}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-3 text-xs font-medium transition-colors ${
                  active
                    ? "border-transparent bg-mode text-mode-foreground shadow-md"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-card"
                }`}
              >
                <Icon className="size-5" aria-hidden />
                {MODE_META[key].label}
              </button>
            );
          })}
        </nav>

        <p className="mt-10 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {current.prompt}
        </p>

        <ul className="mt-4 flex flex-col gap-3">
          {current.categories.map((category) => (
            <li key={category.name}>
              <Link
                href={`/practice/${mode}/${encodeURIComponent(category.name)}`}
                className="block rounded-2xl border border-border bg-card/80 px-5 py-4 font-medium text-card-foreground shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-mode/40 hover:shadow-md"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="mx-auto w-full max-w-md px-5 pb-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-5 border-t border-border pt-5">
          <Link href="/faq" className="hover:text-foreground">
            FAQ
          </Link>
          <a href="mailto:intentionalaffirmations@gmail.com" className="hover:text-foreground">
            Contact
          </a>
          <span className="ml-auto">&copy; 2026 Say This With Me</span>
        </div>
      </footer>
    </div>
  );
}
