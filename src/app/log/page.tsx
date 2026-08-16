import type { Metadata } from "next";
import { LogView } from "@/components/log/log-view";

export const metadata: Metadata = {
  title: "The Log",
  description:
    "Every line your future self has sent you, and the day you said it out loud.",
};

/**
 * The log. A record of the work actually done — which is the point: it is
 * evidence, not a score.
 */
export default function LogPage() {
  return (
    <div data-mode="portal" className="relative isolate flex-1 overflow-x-hidden">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <main className="mx-auto w-full max-w-2xl px-5 pb-24">
        <LogView />
      </main>
    </div>
  );
}
