import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <BrandLogo className="h-9" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Change requires action, not consumption. Speak it out loud — we
              verify every word.
            </p>
          </div>
          <div className="flex gap-16">
            <nav aria-label="Product" className="flex flex-col gap-3 text-sm">
              <span className="font-semibold">Product</span>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Practice
              </Link>
              <Link href="/science" className="text-muted-foreground hover:text-foreground">
                The Science
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
            </nav>
            <nav aria-label="Connect" className="flex flex-col gap-3 text-sm">
              <span className="font-semibold">Connect</span>
              <a
                href="https://www.instagram.com/say_this_with_me/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61578587621492"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                Facebook
              </a>
              <a
                href="mailto:intentionalaffirmations@gmail.com"
                className="text-muted-foreground hover:text-foreground"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Say This With Me. All rights reserved.</p>
          <p>A self-improvement tool — not a substitute for professional mental-health care.</p>
        </div>
      </div>
    </footer>
  );
}
