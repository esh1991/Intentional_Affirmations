import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.saythiswith.me"),
  title: {
    default: "Say This With Me: Voice-Activated Mindset Engine",
    template: "%s — Say This With Me",
  },
  description:
    "Rewire your brain with our Voice-Activated Mindset Engine. Speak new habits and identities into existence with daily affirmations for Powering Up, Breaking Habits, Priming for events, and Rewiring your thoughts.",
  openGraph: {
    type: "website",
    url: "https://www.saythiswith.me",
    title: "Say This With Me: Voice-Activated Mindset Engine",
    description:
      "Speak your future into existence. A 4-in-1 tool to build habits, break patterns, and rewire your identity using your own voice.",
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
      </body>
    </html>
  );
}
