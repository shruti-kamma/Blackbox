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
  // Navigation now consolidated into top header bar with Rankings dropdown
  return null;
}
