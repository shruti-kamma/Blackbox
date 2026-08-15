// MOCK_ORGS itself is intentionally empty (see the comment at its
// declaration below) — this file now supplies only the shared types and
// helper functions get-orgs.ts and the UI components need, whichever data
// source (Postgres or this fallback) is actually live.
// Shaped to match what Prisma actually returns (Organization + latest
// AccessibilityScore + breakdown[]) wherever the two can agree, so
// swapping between them changes only how pages fetch this shape, not the
// pages/components — see get-orgs.ts for the fallback logic itself.

export type OrgType = "COMPANY" | "UNIVERSITY";

export interface ScoreBreakdownItem {
  category: string;
  subscore: number; // 0-100
  industryAverage: number; // 0-100 — for the dimension scorecard's "vs X" comparison
  rationale: string;
  // Absent/undefined (mock data) or null (real data, from Python's JSON
  // null) both mean "none" — components treat them the same way.
  recommendation?: string | null;
  // False for the claim-gated metrics — Retention, Leadership, Employee
  // Feedback (see docs/decisions.md — "Claim-gated metrics"): none of
  // these has a BRSR-mandated disclosure field, so scoring them low for
  // every unclaimed org doesn't differentiate companies, it just drags
  // every composite score down by the same amount. Still scored and
  // shown here (a company that happens to volunteer this rare disclosure
  // still gets credit), but excluded from overallScore until this org is
  // claimed. Absent/undefined means "included" (older data, or a
  // still-observable metric) — components should treat undefined the
  // same as true.
  includedInScore?: boolean;
}

// Index into VERIFICATION_LEVEL_LABELS. Every org starts at 0 (AI Est.) —
// nothing moves up this ladder until a company claims its record and
// submits/backs up additional data (see docs/decisions.md). The label text
// itself is shown in both public and company views (e.g. "AI Est.",
// "Registered") — only the full 6-step progress-bar visualization
// (VerificationLadder) is company-view-only content.
export const VERIFICATION_LEVEL_LABELS = [
  "AI Est.",
  "Registered",
  "Self-Declared",
  "Doc-Verified",
  "Audited",
  "Certified",
] as const;

export type VerificationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface MockOrg {
  id: string;
  slug: string;
  name: string;
  type: OrgType;
  industry: string | null;
  location: string | null;
  logoUrl: string | null;
  description: string | null;
  overallScore: number; // 0-100
  verificationLevel: VerificationLevel;
  methodologyVersion: string;
  generatedAt: string; // ISO date
  breakdown: ScoreBreakdownItem[];
  // Everything below is presentational-only, shown in the Snapshot layout
  // when present. None of it exists in the real pipeline yet (no
  // numeric-parsing step for headcounts, no historical score runs to
  // diff for a trend, no extraction-confidence computation) — real org
  // data (get-orgs.ts) always omits these, and Snapshot components must
  // render without them rather than assume they're always populated.
  scoreTrend?: number; // change over the past 12 months, e.g. +6.4 or -1.4
  employees?: number;
  employeesWithDisabilities?: number;
  // Extraction-confidence signal, not a verification/trust signal — how
  // confident the pipeline is in what it extracted, independent of how
  // much a company has proven/claimed.
  aiConfidence?: number; // 0-100
  evidenceItemCount?: number;
}

// Employee Experience Index shown in the Snapshot is just the "Employee
// Feedback" metric's own subscore — not a separately stored field. Works
// identically for mock and real data as long as that category exists in
// the breakdown (real data always has it; this mock file's older
// 5-category breakdown doesn't, so mock orgs simply won't show this stat
// — see the file-level comment above on why that's left as-is). Employee
// Feedback is claim-gated (see ScoreBreakdownItem.includedInScore) and
// essentially never disclosed pre-claim, so this returns undefined rather
// than a near-always-0 score for unclaimed orgs — same honest-gap
// convention as scoreTrend/employees above.
export function getEmployeeFeedbackScore(breakdown: ScoreBreakdownItem[]): number | undefined {
  const item = breakdown.find((i) => i.category === "Employee Feedback");
  if (!item || item.includedInScore === false) return undefined;
  return item.subscore;
}

// Emptied deliberately (2026-08-13): the real BRSR pipeline now has a
// classified 50-company universe (services/crawler/data/selected_companies_50.json)
// on its way through extraction/scoring into Postgres. Until
// load_scores.py populates real rows, get-orgs.ts's fallback returns
// this empty array rather than fabricated scores sitting next to real
// company names.
export const MOCK_ORGS: MockOrg[] = [];

export function getOrgBySlug(slug: string): MockOrg | undefined {
  return MOCK_ORGS.find((org) => org.slug === slug);
}

export function getOrgsSortedByScore(): MockOrg[] {
  return [...MOCK_ORGS].sort((a, b) => b.overallScore - a.overallScore);
}

// The client's 5-tier maturity ladder — shown in both public and company
// views (unlike VERIFICATION_LEVEL_LABELS' progress-bar visualization,
// which is company-view only). This is the one band/label system used
// everywhere a score needs a text label.
export const MATURITY_LEVEL_LABELS = [
  "Emerging",
  "Developing",
  "Progressing",
  "Leading",
  "Transforming",
] as const;

export type MaturityLevel = (typeof MATURITY_LEVEL_LABELS)[number];

// Sequential intensity scale (muted -> the navy/purple gradient duo) —
// never a red/amber/green severity signal, just more visual weight for a
// higher tier. Centralized here (previously duplicated locally in
// TierLegend) so ScoreBadge/TierLegend/MaturityLadder all draw from one
// mapping. Color always reinforces the tier text, never replaces it —
// WCAG 1.4.1 (don't convey information by color alone) matters more on
// this product than most, given what it's ranking.
export const MATURITY_LEVEL_DOT_CLASS: Record<MaturityLevel, string> = {
  Emerging: "bg-muted-foreground/25",
  Developing: "bg-muted-foreground/45",
  Progressing: "bg-primary/50",
  Leading: "bg-primary/80",
  Transforming: "bg-gradient-to-r from-primary to-secondary",
};

// Provisional score cutoffs — the client hasn't given exact thresholds yet.
// Calibrated only to the one known reference point (score 68 -> "Progressing"
// from the client's initial mockup). Replace once the real cutoffs are confirmed;
// nothing else in the app depends on the exact boundary values.
const MATURITY_THRESHOLDS: { min: number; label: MaturityLevel }[] = [
  { min: 85, label: "Transforming" },
  { min: 70, label: "Leading" },
  { min: 45, label: "Progressing" },
  { min: 25, label: "Developing" },
  { min: 0, label: "Emerging" },
];

export function getMaturityLevel(score: number): MaturityLevel {
  return MATURITY_THRESHOLDS.find((t) => score >= t.min)!.label;
}

// "City, State" -> "State". Falls back to the full string for locations
// without a comma (e.g. "New Delhi", which has no separate state name).
// Returns null for orgs with no location on record — real pipeline data
// has this until a company-metadata classification step exists.
export function parseState(location: string | null): string | null {
  if (!location) return null;
  const parts = location.split(",");
  return parts[parts.length - 1]!.trim();
}

export interface RankInfo {
  rank: number;
  total: number;
}

export interface OrgRanks {
  national: RankInfo;
  industry: RankInfo;
  state: RankInfo;
}

// Rank is always computed within the same OrgType — companies and
// universities are separate rankings (see docs/decisions.md), so a
// university never factors into a company's rank or vice versa.
// `allOrgs` must be the full org set the caller is currently working with
// (mock or real — see get-orgs.ts), so ranks reflect whichever dataset is
// actually live rather than always the fictional mock set. Orgs with a
// null industry/location group together as each other's peers (honest
// given none have real classification yet, rather than being excluded).
export function getOrgRanks(org: MockOrg, allOrgs: MockOrg[]): OrgRanks {
  const sameType = [...allOrgs]
    .filter((o) => o.type === org.type)
    .sort((a, b) => b.overallScore - a.overallScore);
  const sameIndustry = sameType.filter((o) => o.industry === org.industry);
  const orgState = parseState(org.location);
  const sameState = sameType.filter((o) => parseState(o.location) === orgState);

  const rankWithin = (list: MockOrg[]): RankInfo => ({
    rank: list.findIndex((o) => o.id === org.id) + 1,
    total: list.length,
  });

  return {
    national: rankWithin(sameType),
    industry: rankWithin(sameIndustry),
    state: rankWithin(sameState),
  };
}
