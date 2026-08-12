// Registers which rankings modules are mounted in the /ranking section's
// own internal nav (Masthead just renders this list). Ported from
// apps/rankings/src/lib/site-nav.ts (shruti branch) — hrefs updated to sit
// under /ranking now that this section lives inside job-portal instead of
// being its own standalone app.
export type MastheadActive = "companies" | "universities" | "methodology";

export interface NavLink {
  href: string;
  label: string;
  value: MastheadActive;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/ranking/companies", label: "Companies", value: "companies" }, // @blackbox/module-leaderboards
  { href: "/ranking/universities", label: "Universities", value: "universities" }, // @blackbox/module-leaderboards
  { href: "/ranking/methodology", label: "Methodology", value: "methodology" }, // @blackbox/module-methodology
];
