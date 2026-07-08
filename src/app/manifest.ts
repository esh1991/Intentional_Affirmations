import type { MetadataRoute } from "next";

// oklch(0.15 0.015 272) ≈ #16151f — the dark-theme background (brand default).
const BRAND_DARK = "#16151f";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Say This With Me",
    short_name: "Say This",
    description:
      "Speak affirmations out loud — we verify every word as you say it. Stars, streaks, and multi-day journeys reward the action.",
    // Installed app opens the practice hub, not the marketing page.
    start_url: "/practice",
    display: "standalone",
    background_color: BRAND_DARK,
    theme_color: BRAND_DARK,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
