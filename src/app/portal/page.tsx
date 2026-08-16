import type { Metadata } from "next";
import { PortalFlow } from "@/components/portal/portal-flow";

export const metadata: Metadata = {
  title: "Open the channel — Say This With Me",
  description:
    "A version of you who already made it can reach back — but only with instructions, never with answers. Name the life and we'll go find them.",
};

/**
 * The portal (P3-M2). Tuning is anonymous and free; the paid step (the
 * generated portrait) is gated behind sign-in and arrives once FAL_KEY and the
 * blob store are configured.
 */
export default function PortalPage() {
  return (
    <div data-mode="portal" className="relative isolate flex-1 overflow-x-hidden">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <main className="w-full">
        <PortalFlow />
      </main>
    </div>
  );
}
