// Entries for the "Rankings" dropdown in the main site nav (see
// components/nav.tsx) — replaces the old standalone /ranking section nav
// bar (Masthead, removed) that used to list these itself.
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/rankings/companies", label: "Companies" }, // @blackbox/module-leaderboards
  { href: "/rankings/universities", label: "Universities" }, // @blackbox/module-leaderboards
  { href: "/rankings/methodology", label: "Methodology" }, // @blackbox/module-methodology
];
