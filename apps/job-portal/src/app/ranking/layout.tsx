import { SkipLink } from "@blackbox/ui";

// Plain wrapper now — no section-scoped theme or font (see
// docs/decisions.md — the whole site, including /ranking, shares one
// unified theme, not a per-section override; that's what was causing the
// nav-vs-content mismatch this replaced). flex-1 flex-col just keeps this
// section filling the available vertical space within job-portal's own
// body flex layout.
export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SkipLink href="#main-content" />
      {children}
    </div>
  );
}
