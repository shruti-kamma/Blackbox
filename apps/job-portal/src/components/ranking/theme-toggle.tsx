"use client";

import * as React from "react";
import { Button } from "@blackbox/ui";
import { RANKING_ROOT_ID, RANKING_THEME_STORAGE_KEY } from "@/lib/ranking-theme";

type Theme = "light" | "dark";

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

// Ported from apps/rankings (shruti branch), with one deliberate change:
// the original toggled `document.documentElement.dataset.theme` — since
// this section now lives inside the shared job-portal app rather than its
// own standalone <html>, that would leak the rankings light/dark
// preference across the whole site. Scoped to the #ranking-root wrapper
// (see ranking/layout.tsx) instead, so it only affects this section.
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme | null>(null);

  React.useEffect(() => {
    const root = document.getElementById(RANKING_ROOT_ID);
    const current = root?.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  if (theme === null) {
    return <span className="inline-block h-touch-target w-touch-target" aria-hidden="true" />;
  }

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${next} mode`}
      onClick={() => {
        const root = document.getElementById(RANKING_ROOT_ID);
        if (root) root.dataset.theme = next;
        localStorage.setItem(RANKING_THEME_STORAGE_KEY, next);
        setTheme(next);
      }}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
