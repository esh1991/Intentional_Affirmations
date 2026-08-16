import type { Metadata } from "next";
import { PactCall } from "@/components/pact/pact-call";

export const metadata: Metadata = {
  title: "Today's line — Say This With Me",
  description:
    "One line a day, through the same door. Read it back out loud and we check every word.",
};

/** The daily call (P3-M4). Same door every day — that is the whole mechanic. */
export default function PactPage() {
  return (
    <div data-mode="portal" className="relative isolate flex-1 overflow-x-hidden">
      <main className="w-full">
        <PactCall />
      </main>
    </div>
  );
}
