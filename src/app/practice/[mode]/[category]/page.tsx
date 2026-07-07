import Link from "next/link";
import { notFound } from "next/navigation";
import { MODE_META, findCategory, isModeKey } from "@/lib/content";

/**
 * M2 builds the real speaking experience here (SpeechVerifier + live word
 * highlighting). Until then this is an honest placeholder so category links
 * have somewhere to go. Spec: docs/roadmap/phase-1-rebuild.md
 */
export default async function PracticePage({
  params,
}: {
  params: Promise<{ mode: string; category: string }>;
}) {
  const { mode, category } = await params;
  if (!isModeKey(mode)) notFound();
  const categoryData = findCategory(mode, decodeURIComponent(category));
  if (!categoryData) notFound();

  return (
    <div data-mode={mode} className="relative isolate flex min-h-dvh flex-col">
      <div className="mode-glow pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {MODE_META[mode].label}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight">
          {categoryData.name}
        </h1>
        <p className="mt-6 text-muted-foreground">
          The speaking experience is being rebuilt and lands here next. Check
          back very soon.
        </p>
        <Link
          href={`/?mode=${mode}`}
          className="mt-8 rounded-full bg-mode px-6 py-2.5 font-medium text-mode-foreground shadow-md transition-transform hover:-translate-y-0.5"
        >
          Back home
        </Link>
      </main>
    </div>
  );
}
