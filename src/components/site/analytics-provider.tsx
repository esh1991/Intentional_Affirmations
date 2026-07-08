"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, trackPageview } from "@/lib/analytics";

/** Initializes PostHog (env-gated) and captures SPA pageviews. */
export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  return null;
}
