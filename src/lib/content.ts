import { z } from "zod";
import raw from "@/content/mindset-data.json";

/**
 * File-based content for Phase 1. The shape mirrors the planned Phase 2
 * Postgres schema (affirmation_sets → categories → affirmations) so the
 * migration is a straight mapping. Spec: docs/roadmap/phase-1-rebuild.md
 */

export const MODE_KEYS = ["powerUp", "breakIt", "primeMe", "rewire"] as const;
export type ModeKey = (typeof MODE_KEYS)[number];

const affirmationSchema = z.object({
  affirmation: z.string().min(1),
  successMessage: z.string().min(1),
});

const categorySchema = z.object({
  name: z.string().min(1),
  items: z.array(affirmationSchema).min(1),
});

const modeSchema = z.object({
  theme: z.string().min(1),
  prompt: z.string().min(1),
  categories: z.array(categorySchema).min(1),
});

const contentSchema = z.object({
  powerUp: modeSchema,
  breakIt: modeSchema,
  primeMe: modeSchema,
  rewire: modeSchema,
});

export type Affirmation = z.infer<typeof affirmationSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Mode = z.infer<typeof modeSchema>;
export type Content = z.infer<typeof contentSchema>;

/** Parsed once at module load; a content mistake fails the build, not the user. */
export const content: Content = contentSchema.parse(raw);

export const MODE_META: Record<ModeKey, { label: string; tagline: string }> = {
  powerUp: { label: "Power Up", tagline: "Speak the identity you want to build." },
  breakIt: { label: "Break It", tagline: "Use this whenever you feel the urge." },
  primeMe: { label: "Prime Me", tagline: "Say this before your next big moment." },
  rewire: { label: "Rewire", tagline: "Train your mind to work for you." },
};

export function isModeKey(value: string): value is ModeKey {
  return (MODE_KEYS as readonly string[]).includes(value);
}

export function findCategory(mode: ModeKey, name: string): Category | undefined {
  return content[mode].categories.find((c) => c.name === name);
}
