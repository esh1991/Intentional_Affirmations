import { notFound } from "next/navigation";
import { findCategory, isModeKey } from "@/lib/content";
import { PracticeScreen } from "@/components/app/practice-screen";

// This page renders per-request (dynamic route), so a random pick here gives
// each visit a fresh affirmation while SSR and hydration stay consistent.
function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

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
    <PracticeScreen
      mode={mode}
      categoryName={categoryData.name}
      items={categoryData.items}
      initialIndex={randomIndex(categoryData.items.length)}
      journey={categoryData.journey ?? null}
    />
  );
}
