"use client";

import { Zap } from "lucide-react";
import { readStreak } from "@/lib/streak";
import { useClientValue } from "@/hooks/use-client-value";

export function StreakBadge() {
  // null during SSR/hydration, when localStorage isn't available
  const streak = useClientValue(readStreak);

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-sm font-medium text-card-foreground shadow-sm backdrop-blur transition-opacity"
      style={{ opacity: streak === null ? 0 : 1 }}
      title="Complete an affirmation every day to keep your streak."
    >
      <Zap className="size-4 text-mode" fill="currentColor" aria-hidden />
      <span>Day {streak ?? 0}</span>
    </div>
  );
}
