import Link from "next/link";
import {
  ArrowRight,
  FlaskConical,
  HeartPulse,
  Moon,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { DOMAIN_LIST, type DomainKey } from "@/lib/portal/domains";
import { ChooseArt, LockInArt, SpeakArt } from "@/components/illustrations";
import { PortalDemo } from "@/components/home/portal-demo";
import { WelcomeBack } from "@/components/home/welcome-back";
import { EmailSignup } from "@/components/home/email-signup";

/**
 * Marketing front door. The premise: a version of you further along can reach
 * back, but is not permitted to tell you what happened — only what to do.
 *
 * The restriction is the product, not set dressing (decision 10). It keeps the
 * app honest, because we genuinely cannot know anyone's future; it makes
 * serving the effort-draining fantasy structurally impossible, because they
 * can never show you the trophy; and reading the line back out loud is a radio
 * read-back handshake, which is why word-for-word verification exists at all.
 *
 * The CTA routes to /portal (P3-M2). The browse hub at /practice stays live
 * underneath until the M5 cutover and still owns the speaking flow, which is
 * where the portal hands off.
 */

const STEPS = [
  {
    art: ChooseArt,
    title: "Tell them who to look for",
    body: "Name the life you're reaching for — the body, the work, the calm, the person you want to be in the room. That's who we go looking for.",
  },
  {
    art: SpeakArt,
    title: "Read it back, out loud",
    body: "They send one line — an instruction, never a spoiler. You read it back so both ends know it landed. Every word lights up as you speak it; the rep only counts when you say it.",
  },
  {
    art: LockInArt,
    title: "Same door tomorrow",
    body: "One line a day, through the same door, for 7 or 21 days. Seven to feel it, twenty-one to become it — and they only ever hand you the next thing to do.",
  },
];

/**
 * The five life domains the portal tunes on. This replaced the four practice
 * modes at the M5 cutover — the browse hub is gone, so the home page sells the
 * axis the product actually works on. Copy lives here rather than in
 * domains.ts, which is a data module, not a marketing one.
 */
const DOMAIN_CARDS: Record<DomainKey, { icon: typeof Wrench; body: string }> = {
  body: {
    icon: HeartPulse,
    body: "They train before work without negotiating with themselves. Ask them what the first week actually felt like.",
  },
  craft: {
    icon: Wrench,
    body: "They finished the thing you keep talking about. They can't tell you how it lands — only what they did on the mornings they didn't want to.",
  },
  wealth: {
    icon: Wallet,
    body: "They stopped avoiding the number. Not the amount — they're not allowed to say that — the evening they finally opened it and looked.",
  },
  calm: {
    icon: Moon,
    body: "They sleep without replaying the day. Ask them about two in the morning; that's the part they're cleared to talk about.",
  },
  connection: {
    icon: Users,
    body: "They're present with the people in front of them. They remember exactly which habit had to go first.",
  },
};

export default function Home() {
  return (
    <div data-mode="portal" className="relative isolate flex-1 overflow-x-hidden">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <main className="mx-auto w-full max-w-6xl px-5 pb-24">
        {/* Hero */}
        <section className="mx-auto max-w-3xl pt-14 text-center sm:pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Say this with me
          </p>
          <h1 className="font-display mt-4 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Your future self isn&apos;t allowed to tell you what happens.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            They&apos;re allowed to tell you what to <em>do</em>. A version of
            you who already made it can reach back — but only with
            instructions, never with answers. One line gets through a day. Read
            it back out loud and we check every word.
          </p>
          <WelcomeBack />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/portal"
              className="rounded-full bg-mode px-8 py-3.5 font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Open the channel
            </Link>
            <Link
              href="/science"
              className="rounded-full border border-border bg-card/60 px-8 py-3.5 font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              See the science
            </Link>
          </div>
        </section>

        <section className="mt-6 sm:mt-8" aria-label="Live demo">
          <PortalDemo />
        </section>

        {/* How it works */}
        <section className="mt-24 sm:mt-32">
          <h2 className="font-display text-center text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            How the call works
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

        {/* Which version are you reaching for */}
        <section className="mt-24 sm:mt-32">
          <h2 className="font-display text-center text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Which version are you reaching for?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-pretty text-muted-foreground">
            Different lives, one mechanic: they send the words, you read them
            back out loud, and we verify every one.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {DOMAIN_LIST.map((domain) => {
              const card = DOMAIN_CARDS[domain.key];
              return (
                <Link
                  key={domain.key}
                  href="/portal"
                  data-mode={domain.key}
                  className="group flex flex-col rounded-3xl border border-border/60 bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-mode/50 hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-mode text-mode-foreground shadow-md">
                      <card.icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-widest text-mode-2">
                      {domain.label}
                    </span>
                  </div>
                  <h3 className="font-display mt-5 text-balance text-2xl font-semibold leading-snug">
                    {domain.prompt}
                  </h3>
                  <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                  <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-mode-2">
                    Reach them
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Science strip */}
        <section className="mt-24 sm:mt-32">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/60 bg-card p-8 text-center sm:flex-row sm:p-10 sm:text-left">
            <FlaskConical className="size-12 shrink-0 text-mode-2" aria-hidden />
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Why they can only give you instructions
              </h2>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                People who picture their future self clearly save more and
                follow through more often. But simply savouring the win can
                drain the drive to chase it — which is why you never get the
                ending here, only the next thing to do. We cite the limits too.
                Reps, not spells.
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
            We&apos;re building the portal — your own face, your own future
            self, your own words. Get it first, no spam, unsubscribe anytime.
          </p>
          <div className="relative mt-8 flex w-full justify-center">
            <EmailSignup />
          </div>
        </section>
      </main>
    </div>
  );
}
