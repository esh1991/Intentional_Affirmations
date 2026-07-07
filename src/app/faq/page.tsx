import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — Say This With Me",
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
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-10">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to the app
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Frequently Asked Questions
      </h1>
      <div className="mt-8 flex flex-col gap-4">
        {FAQS.map((faq) => (
          <section
            key={faq.question}
            className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm"
          >
            <h2 className="font-semibold">{faq.question}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
