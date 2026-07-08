import Link from "next/link";
import {
  ArrowRight,
  CircleOff,
  FlaskConical,
  RefreshCw,
  Target,
  Zap,
} from "lucide-react";
import type { ModeKey } from "@/lib/content";
import { MODE_META } from "@/lib/content";
import { ChooseArt, LockInArt, SpeakArt } from "@/components/illustrations";
import { HeroDemo } from "@/components/home/hero-demo";
import { WelcomeBack } from "@/components/home/welcome-back";
import { EmailSignup } from "@/components/home/email-signup";

/**
 * Marketing front door. The app surface lives at /practice — this page's one
 * job is to show the verified-speaking mechanic and route people into it.
 */

const STEPS = [
  {
    art: ChooseArt,
    title: "Choose your focus",
    body: "Four modes, thirteen categories — from becoming a decisive leader to quitting the scroll.",
  },
  {
    art: SpeakArt,
    title: "Say it out loud",
    body: "The mic listens and every word lights up as you speak it. No skimming, no mumbling past it — the rep only counts when you say it.",
  },
  {
    art: LockInArt,
    title: "Lock it in",
    body: "Stars, streaks, and 7–21 day journeys turn a one-off rep into a daily practice.",
  },
];

const MODES: Array<{
  key: ModeKey;
  icon: typeof Zap;
  headline: string;
  body: string;
}> = [
  {
    key: "powerUp",
    icon: Zap,
    headline: "Become who you're aiming for",
    body: "A decisive leader. A calm parent. Your healthiest self. Speak the identity until it's yours.",
  },
  {
    key: "breakIt",
    icon: CircleOff,
    headline: "For the moment the urge hits",
    body: "Mindless scrolling, overthinking, negative self-talk — interrupt the loop out loud, right when it starts.",
  },
  {
    key: "primeMe",
    icon: Target,
    headline: "Right before it counts",
    body: "A big meeting, the start of the workday, winding down for sleep. Prime your state in thirty seconds.",
  },
  {
    key: "rewire",
    icon: RefreshCw,
    headline: "Flip the old stories",
    body: "“I'm not good enough.” “I'm afraid to fail.” Say the flip side every day until it sticks.",
  },
];

export default function Home() {
  return (
    <div data-mode="powerUp" className="relative isolate flex-1">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <main className="mx-auto w-full max-w-6xl px-5 pb-24">
        {/* Hero */}
        <section className="mx-auto max-w-3xl pt-14 text-center sm:pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            The voice-activated mindset engine
          </p>
          <h1 className="font-display mt-4 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Don&apos;t just read affirmations. Say them.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Speak the words out loud and watch them light up as we verify every
            one. Change requires action, not consumption.
          </p>
          <WelcomeBack />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/practice"
              className="rounded-full bg-mode px-8 py-3.5 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Start practicing — it&apos;s free
            </Link>
            <Link
              href="/science"
              className="rounded-full border border-border bg-card/60 px-8 py-3.5 font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              See the science
            </Link>
          </div>
        </section>

        <section className="mt-14 sm:mt-16" aria-label="Live demo">
          <HeroDemo />
        </section>

        {/* How it works */}
        <section className="mt-24 sm:mt-32">
          <h2 className="font-display text-center text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex flex-col items-center rounded-3xl border border-border/60 bg-card p-8 text-center shadow-sm"
              >
                <step.art className="size-16 text-mode-2" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {i + 1}
                </p>
                <h3 className="font-display mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Four ways to train */}
        <section className="mt-24 sm:mt-32">
          <h2 className="font-display text-center text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Four ways to train
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-pretty text-muted-foreground">
            Different moments call for different words. Every mode uses the
            same mechanic: say it out loud, we verify it.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {MODES.map((mode) => (
              <Link
                key={mode.key}
                href={`/practice?mode=${mode.key}`}
                data-mode={mode.key}
                className="group flex flex-col rounded-3xl border border-border/60 bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-mode/50 hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-mode text-mode-foreground shadow-md">
                    <mode.icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-widest text-mode-2">
                    {MODE_META[mode.key].label}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-balance text-2xl font-semibold leading-snug">
                  {mode.headline}
                </h3>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {mode.body}
                </p>
                <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-mode-2">
                  Explore {MODE_META[mode.key].label}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Science strip */}
        <section className="mt-24 sm:mt-32">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/60 bg-card p-8 text-center sm:flex-row sm:p-10 sm:text-left">
            <FlaskConical className="size-12 shrink-0 text-mode-2" aria-hidden />
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Honest science, no magic
              </h2>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                Spoken self-affirmation engages the brain&apos;s self-processing
                and valuation systems and buffers stress — and the research has
                limits, which we cite too. Reps, not spells.
              </p>
            </div>
            <Link
              href="/science"
              className="shrink-0 rounded-full border border-border bg-card/60 px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              Read the research
            </Link>
          </div>
        </section>

        {/* Email capture */}
        <section className="mt-24 flex flex-col items-center text-center sm:mt-32">
          <h2 className="font-display text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Be first in line
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-muted-foreground">
            New journeys and practice packs land regularly. Get them first — no
            spam, unsubscribe anytime.
          </p>
          <div className="relative mt-8 flex w-full justify-center">
            <EmailSignup />
          </div>
        </section>
      </main>
    </div>
  );
}
