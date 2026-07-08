import type { Metadata } from "next";
import { content } from "@/lib/content";
import { HomeScreen } from "@/components/app/home-screen";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Pick a mode and a category, then say the affirmation out loud — we verify every word as you speak.",
};

export default function PracticePage() {
  return <HomeScreen content={content} />;
}
