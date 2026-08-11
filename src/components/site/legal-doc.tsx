import type { ReactNode } from "react";

/** Shared chrome for /legal/* — same page shell as /faq and /science. */
export function LegalDoc({
  title,
  updated,
  lede,
  children,
}: {
  title: string;
  updated: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <div className="relative isolate flex-1">
      <div className="mode-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />
      <main className="mx-auto w-full max-w-3xl px-5 pb-20">
        <div className="pt-14 text-center sm:pt-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Last updated {updated}
          </p>
          <h1 className="mt-3 font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance leading-relaxed text-muted-foreground">
            {lede}
          </p>
        </div>
        <div className="mt-12 flex flex-col gap-10">{children}</div>
      </main>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{heading}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-2 pl-5">{children}</ul>;
}
