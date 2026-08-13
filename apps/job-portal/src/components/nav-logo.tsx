"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The main site wordmark. Appends the "B4I" sub-brand badge whenever the
// user is anywhere under /ranking, so the logo itself signals which
// product area they're in — replaces the old standalone /ranking
// section's own separate masthead + "B4I" wordmark (see
// docs/decisions.md), now that there's one shared nav instead of two
// stacked ones.
export function NavLogo() {
  const pathname = usePathname();
  const isRanking = pathname?.startsWith("/ranking") ?? false;

  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="font-serif text-xl font-bold tracking-tight text-foreground">
        Blackbox<span className="text-primary">.</span>
      </span>
      {isRanking && (
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold tracking-wide text-foreground border border-border font-sans">
          B4I
        </span>
      )}
    </Link>
  );
}
