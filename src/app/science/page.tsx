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

/**
 * The science page, rewritten at the M5 cutover.
 *
 * The previous version led with "Neuroplasticity: your brain is rewireable —
 * you physically build a new, stronger path". That is the exact claim the
 * honest-science brand rule forbids, and the one the arc-generation prompt
 * blocks in generated content. It had to go on correctness grounds, not taste.
 *
 * What replaces it is stronger, not weaker: future-self continuity is a real
 * literature, and it happens to be the licence for the thing this app now
 * does — showing someone a rendered image of who they're becoming.
 */

export const metadata: Metadata = {
  title: "The Science",
  description:
    "Why picturing your future self clearly changes what you do today — future-self continuity, episodic future thinking, and mental contrasting. Including the limits.",
};

const STEPS = [
  {
    title: "Name the version of you",
    body: "You say which life you're reaching for. That's the only thing they get to work from.",
    art: ChooseArt,
  },
  {
    title: "Read the line back",
    body: "They send one instruction a day. Saying it out loud is the rep — and we verify every word.",
    art: SpeakArt,
  },
  {
    title: "Come back tomorrow",
    body: "Same door, 7 or 21 days. Miss one and nothing resets; it just waits for you.",
    art: LockInArt,
  },
];

const CONCEPTS = [
  {
    id: "future-self-continuity",
    title: "People who feel connected to their future self treat them better",
    body: "This is the closest thing to a foundation this app has. In work led by Hal Hershfield, people shown age-progressed images of their own face went on to allocate more money to their future — the effect runs through how connected they feel to the person they'll become, not through motivation or willpower. Feeling that the future you is genuinely you changes what the present you is willing to do for them. It is also, plainly, why this app renders your face rather than a stock photo.",
    sourceHref:
      "https://journals.sagepub.com/doi/10.1509/jmkr.48.SPL.S23",
    sourceLabel: "Hershfield et al., 2011",
    art: FlipArrowArt,
  },
  {
    id: "episodic-future-thinking",
    title: "Imagining a specific future makes it weigh more today",
    body: "Vividly picturing a concrete future event reduces how steeply people discount the future — the well-studied bias where a reward now beats a bigger reward later. The operative word is specific. \"I'll be healthier\" does nothing. \"I'm putting my shoes by the door tonight\" is the kind of detail that moves behaviour, which is why every line here is one concrete action rather than a description of the destination.",
    sourceHref: "https://pubmed.ncbi.nlm.nih.gov/20620877/",
    sourceLabel: "Peters & Büchel, 2010",
    art: SunriseArt,
  },
  {
    id: "mental-contrasting",
    title: "The finding that argues against a naive version of this app",
    body: "Gabriele Oettingen's work shows that simply enjoying a fantasy of success can drain the energy to pursue it — you collect some of the reward without doing the work. We take that seriously enough to build against it. It is the reason your future self is never allowed to tell you how things turn out, only what to do next: an app that hands you the ending is the exact failure this research describes.",
    sourceHref: "https://pubmed.ncbi.nlm.nih.gov/12088132/",
    sourceLabel: "Oettingen et al., 2001",
    art: SpiralArt,
  },
  {
    id: "saying-it-out-loud",
    title: "Saying it out loud, and what that does and doesn't do",
    body: "Spoken self-affirmation engages the brain's self-processing and valuation systems, and self-affirmation reliably buffers stress responses under pressure. That's a real, measured effect — and it is narrower than the internet suggests. It is not a mechanism for making things happen. We ask you to speak because a rep you can be verified on is different from a thought you had.",
    sourceHref: "https://pubmed.ncbi.nlm.nih.gov/26541373/",
    sourceLabel: "Cascio et al., 2016",
    art: SpeakArt,
  },
  {
    id: "the-limits",
    title: "Where this doesn't work — and we'd rather say so",
    body: "Positive self-statements can backfire. Wood, Perunovic and Lee found that for people with low self-esteem, repeating statements they don't believe left them feeling worse than saying nothing. If a line here feels like a lie when you say it, that is a signal to pick a smaller one, not to push harder. This is a practice tool, not treatment, and it is no substitute for a professional when you need one.",
    sourceHref: "https://pubmed.ncbi.nlm.nih.gov/19493324/",
    sourceLabel: "Wood, Perunovic & Lee, 2009",
    art: LockInArt,
  },
];

export default function SciencePage() {
  return (
    <div data-mode="portal" className="relative isolate flex-1">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <main className="mx-auto w-full max-w-6xl px-5 pb-20">
        <section className="mx-auto max-w-3xl pt-14 text-center sm:pt-20">
          <h1 className="font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Why a future self, and not a pep talk
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            There is real research behind picturing the person you&apos;re
            becoming. There is also research on where it goes wrong, and we
            build against that too. Both are below.
          </p>
        </section>

        <section id="how-it-works" className="mt-16">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            How it works
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
            What the research actually says
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
                    <h3 className="font-display text-balance text-xl font-semibold">
                      {concept.title}
                    </h3>
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
                    {concept.sourceLabel}
                    <ArrowRight className="size-4" aria-hidden />
                  </a>
                  <div className="ml-auto">
                    <ShareButton id={concept.id} title={concept.title} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-2xl text-center">
          <h2 className="font-display text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            One line a day, said out loud.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            No prophecy, no promises about how it turns out. Just the next thing
            to do, from someone who remembers being you.
          </p>
          <Link
            href="/portal"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-mode px-8 py-3.5 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Open the channel
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </section>
      </main>
    </div>
  );
}
