import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AnalyticsProvider } from "@/components/site/analytics-provider";
import { ServiceWorkerRegistration } from "@/components/site/service-worker";
import { SyncManager } from "@/components/auth/sync-manager";
import { ThemeProvider } from "@/components/site/theme-provider";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

/**
 * Site metadata, rewritten at the M5 cutover.
 *
 * The previous copy promised to "rewire your brain" and to "speak your future
 * into existence" — the two claims the honest-science rule exists to prevent,
 * sitting on every page of the site and in every search result. It also sold a
 * "4-in-1 tool", which no longer exists.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.saythiswith.me"),
  title: {
    default: "Say This With Me: talk to your future self",
    template: "%s — Say This With Me",
  },
  description:
    "Your future self isn't allowed to tell you what happens — only what to do. One line a day, read back out loud, verified word for word.",
  openGraph: {
    type: "website",
    url: "https://www.saythiswith.me",
    title: "Say This With Me: talk to your future self",
    description:
      "A version of you who already made it can reach back, but only with instructions, never with answers. One line gets through a day.",
    images: ["/say-this-with-me-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </ThemeProvider>
        <ServiceWorkerRegistration />
        <AnalyticsProvider />
        <SyncManager />
        {process.env.NODE_ENV === "production" && (
          <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
