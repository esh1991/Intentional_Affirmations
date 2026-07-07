"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle light/dark theme"
      className="flex size-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
    >
      {/* CSS decides which icon shows, so SSR needs no theme knowledge */}
      <Sun className="hidden size-4 dark:block" aria-hidden />
      <Moon className="size-4 dark:hidden" aria-hidden />
    </button>
  );
}
