import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about the Say This With Me voice-activated mindset engine.",
};

const FAQS = [
  {
    question: "Is this app free?",
    answer:
      "Yes, the core features of the Mindset Engine are completely free to use.",
  },
  {
    question: "Why do I need to use my microphone?",
    answer:
      "The science of Embodied Cognition shows that speaking an affirmation out loud is far more powerful than just thinking it. Our app listens to confirm you've completed the exercise, which helps lock in the new thought pattern.",
  },
  {
    question: "Is my voice data stored?",
    answer:
      "We never receive, store, or have access to your voice — your audio never touches our servers. Speech recognition is handled by your browser's built-in speech service, and depending on your browser this may involve sending audio to the browser maker's servers to be converted to text (for example, Chrome uses Google's speech servers). Please see your browser's privacy policy for details on how it handles speech recognition.",
  },
  {
    question: "What if my browser doesn't support speech recognition?",
    answer:
      "Speech recognition works best in Chrome and other Chromium browsers. If your browser doesn't support it (or you can't speak out loud right now), every exercise offers a typing fallback — say the affirmation as you type it word for word.",
  },
];

export default function FaqPage() {
  return (
    <div className="relative isolate flex-1">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <main className="mx-auto w-full max-w-3xl px-5 pb-20">
        <div className="pt-14 text-center sm:pt-20">
          <h1 className="font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
        </div>
        <div className="mt-10 flex flex-col gap-4">
          {FAQS.map((faq) => (
            <section
              key={faq.question}
              className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
            >
              <h2 className="font-display text-lg font-semibold">{faq.question}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
