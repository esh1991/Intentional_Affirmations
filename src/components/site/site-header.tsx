import Link from "next/link";
import { StreakBadge } from "@/components/app/streak-badge";
import { BrandLogo } from "@/components/site/brand-logo";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="shrink-0" aria-label="Say This With Me — home">
          <BrandLogo className="h-10" />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Site">
          <Link
            href="/practice"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Practice
          </Link>
          <Link
            href="/science"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            The Science
          </Link>
          <Link
            href="/faq"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            FAQ
          </Link>
          <div className="ml-1 flex items-center gap-2 sm:ml-2">
            <StreakBadge />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
