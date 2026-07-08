import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShareButton } from "@/components/site/share-button";
import {
  ChooseArt,
  SpeakArt,
  LockInArt,
  SpiralArt,
  FlipArrowArt,
  SunriseArt,
} from "@/components/illustrations";

export const metadata: Metadata = {
  title: "How It Works & The Science",
  description:
    "Learn how the Say This With Me engine works in 3 simple steps, and explore the science of neuroplasticity, habit loops, and cognitive priming that powers it.",
};

const STEPS = [
  {
    title: "Choose your focus",
    body: "Select the mental task you want to perform, from building an identity to breaking a habit.",
    art: ChooseArt,
  },
  {
    title: "Speak your intention",
    body: "Using your voice actively engages your brain, making the new thought pattern more powerful.",
    art: SpeakArt,
  },
  {
    title: "Lock in your progress",
    body: "Instant feedback rewards your brain, strengthening the new pathway and making change last.",
    art: LockInArt,
  },
];

const CONCEPTS = [
  {
    id: "neuroplasticity",
    title: "Neuroplasticity: your brain is rewireable",
    body: "Your brain is not fixed. Every thought reinforces a neural pathway. When you consistently speak a new thought (“I am confident”), you physically build a new, stronger path, making that thought your new default.",
    sourceHref: "https://www.youtube.com/watch?v=LNHBMFCzznE",
    practiceMode: "powerUp",
    art: FlipArrowArt,
  },
  {
    id: "habit-loop",
    title: "The habit loop: hijacking your routine",
    body: "Destructive habits run on a simple loop: cue, routine, reward. “Break It” works by consciously inserting a new routine — speaking a powerful truth — to overwrite the old one and build a healthier response.",
    sourceHref: "https://charlesduhigg.com/the-power-of-habit/",
    practiceMode: "breakIt",
    art: SpiralArt,
  },
  {
    id: "priming",
    title: "Cognitive priming: preparing your mind",
    body: "“Prime Me” is based on the proven concept that exposing your brain to specific ideas (like “calm” or “focus”) makes those states more accessible. You are pre-loading your desired mindset right before you need it most.",
    sourceHref: "https://en.wikipedia.org/wiki/Priming_(psychology)",
    practiceMode: "primeMe",
    art: SunriseArt,
  },
];

export default function SciencePage() {
  return (
    <div className="relative isolate flex-1">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <main className="mx-auto w-full max-w-6xl px-5 pb-20">
        <section className="mx-auto max-w-3xl pt-14 text-center sm:pt-20">
          <h1 className="font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            The Mindset Engine
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground sm:text-lg">
            A practical guide on how to use this tool, and the science that
            makes it so effective.
          </p>
        </section>

        <section id="how-it-works" className="mt-16">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            How it works — 3 simple steps
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex flex-col items-center rounded-3xl border border-border/60 bg-card p-6 text-center"
              >
                <step.art className="size-20 text-mode-2" />
                <span className="mt-4 flex size-8 items-center justify-center rounded-full bg-mode text-sm font-semibold text-mode-foreground">
                  {i + 1}
                </span>
                <h3 className="font-display mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="the-science" className="mt-16 scroll-mt-24">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            The science behind it
          </h2>
          <div className="mt-6 flex flex-col gap-5">
            {CONCEPTS.map((concept) => (
              <article
                key={concept.id}
                id={concept.id}
                className="scroll-mt-24 rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
              >
                <div className="flex items-start gap-5">
                  <concept.art className="hidden size-16 shrink-0 text-mode-2 sm:block" />
                  <div>
                    <h3 className="font-display text-xl font-semibold">{concept.title}</h3>
                    <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
                      {concept.body}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <a
                    href={concept.sourceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-semibold text-mode-2 underline-offset-4 hover:underline"
                  >
                    Learn the science
                    <ArrowRight className="size-4" aria-hidden />
                  </a>
                  <Link
                    href={`/practice?mode=${concept.practiceMode}`}
                    className="flex items-center gap-1.5 text-sm font-semibold text-mode-2 underline-offset-4 hover:underline"
                  >
                    Put it to practice
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <div className="ml-auto">
                    <ShareButton id={concept.id} title={concept.title} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
