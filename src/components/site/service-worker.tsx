"use client";

import { useEffect } from "react";

/** Registers the minimal PWA service worker (public/sw.js) in production. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch(() => {});
  }, []);
  return null;
}
