/*
 * Minimal service worker: makes the app installable and pre-warms the small
 * static assets the practice flow uses. Deliberately NO handler for
 * navigations/HTML — pages always come from the network, so a deploy is never
 * masked by a stale cache. (Serwist/Workbox skipped: they require webpack,
 * this project builds with Turbopack.)
 */
const CACHE = "stwm-static-v1";
const STATIC_ASSETS = [
  "/click.mp3",
  "/success.mp3",
  "/icon-192.png",
  "/icon-512.png",
  "/mindset-engine-reward-trophy.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    !STATIC_ASSETS.includes(url.pathname)
  ) {
    return; // fall through to the network untouched
  }
  event.respondWith(
    caches.match(event.request).then((hit) => hit ?? fetch(event.request)),
  );
});
