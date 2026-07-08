"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { readStreak } from "@/lib/streak";
import { useClientValue } from "@/hooks/use-client-value";

/**
 * Returning visitors with a live streak shouldn't have to scroll past the
 * pitch — give them a one-tap path back into the app.
 */
export function WelcomeBack() {
  const streak = useClientValue(readStreak);
  if (!streak) return null;
  return (
    <Link
      href="/practice"
      className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <Zap className="size-4 text-mode-2" fill="currentColor" aria-hidden />
      Welcome back — day {streak} streak
      <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  );
}
