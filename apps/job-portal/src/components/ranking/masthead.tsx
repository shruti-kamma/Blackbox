import Link from "next/link";
import { cn } from "@blackbox/ui";
import { NAV_LINKS, type MastheadActive } from "@/lib/ranking-nav";

export type { MastheadActive };

export interface MastheadProps {
  active?: MastheadActive;
}

// Ported from apps/rankings' Masthead (shruti branch) — this is the
// /ranking section's own internal nav, sitting below job-portal's main
// site nav (see app/ranking/layout.tsx), exactly the "if the shruti
// website has its own navigation, keep it working" requirement. Kept
// deliberately thin (py-3, compact wordmark) since it stacks directly
// on top of job-portal's own site nav — two full-height header bars
// would eat too much vertical space, especially now that the leaderboard
// pages are dense (index summary + sidebars) and want the room. No
// light/dark toggle and no spelled-out tagline — light-only, wordmark
// alone, matching the same "as thin and plain as it can be" direction.
export function Masthead({ active }: MastheadProps) {
  return (
    <header className="border-b border-foreground">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/ranking" className="font-serif text-2xl font-bold tracking-tight text-foreground">
          B4I
        </Link>
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
      </div>
    </header>
  );
}
