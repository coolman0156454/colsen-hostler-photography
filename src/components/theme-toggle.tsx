"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
        "border-zinc-300 bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
        "dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-800",
      )}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
