import Link from "next/link";
import { cn } from "@blackbox/ui";
import { ThemeToggle } from "./theme-toggle";
import { NAV_LINKS, type MastheadActive } from "@/lib/ranking-nav";

export type { MastheadActive };

export interface MastheadProps {
  active?: MastheadActive;
}

// Ported from apps/rankings' Masthead (shruti branch), later given the
// editorial redesign's bigger wordmark treatment — this is the /ranking
// section's own internal nav, sitting below job-portal's main site nav
// (see app/ranking/layout.tsx), exactly the "if the shruti website has
// its own navigation, keep it working" requirement.
export function Masthead({ active }: MastheadProps) {
  return (
    <header className="border-b border-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Blackbox India&rsquo;s Inclusion Intelligence Index
          </p>
          <Link
            href="/ranking"
            className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
          >
            B4I
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <nav aria-label="Primary" className="flex gap-1 text-sm font-medium uppercase tracking-wide">
            {NAV_LINKS.map((link) => {
              const isActive = link.value === active;
              return (
                <Link
                  key={link.value}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 hover:bg-muted",
                    isActive ? "bg-foreground text-background font-semibold" : "text-muted-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
