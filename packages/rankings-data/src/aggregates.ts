import { getMaturityLevel, MATURITY_LEVEL_LABELS, parseState, type MaturityLevel, type MockOrg } from "./mock-orgs";

// Sidebar/summary widgets for the leaderboard pages (see docs/decisions.md
// — "Replicate AIDEZA dashboard format"). Every function takes the org
// list as a parameter rather than reading MOCK_ORGS internally, same
// pattern as getOrgRanks — so these work correctly against whichever
// dataset (mock or real) get-orgs.ts actually returned for the request.

export interface IndexSummary {
  averageScore: number;
  count: number;
  // undefined, not 0, when no org in the set has scoreTrend defined —
  // an honest gap, not a guessed "no change" value (same convention as
  // org-snapshot-content.tsx's hasTrend).
  averageTrend: number | undefined;
}

export function getIndexSummary(orgs: MockOrg[]): IndexSummary {
  const count = orgs.length;
  const averageScore = count === 0 ? 0 : orgs.reduce((sum, o) => sum + o.overallScore, 0) / count;

  const trends = orgs.map((o) => o.scoreTrend).filter((t): t is number => t !== undefined);
  const averageTrend = trends.length === 0 ? undefined : trends.reduce((sum, t) => sum + t, 0) / trends.length;

  return { averageScore, count, averageTrend };
}

export interface MaturityDistributionEntry {
  level: MaturityLevel;
  count: number;
  percentage: number; // 0-100, rounded
}

// Ordered by MATURITY_LEVEL_LABELS (Emerging -> Transforming), not by
// count, so the distribution bar/legend renders in a stable, meaningful
// order rather than jumping around as data changes.
export function getMaturityDistribution(orgs: MockOrg[]): MaturityDistributionEntry[] {
  const total = orgs.length;
  const counts = new Map<MaturityLevel, number>(MATURITY_LEVEL_LABELS.map((level) => [level, 0]));
  for (const org of orgs) {
    const level = getMaturityLevel(org.overallScore);
    counts.set(level, (counts.get(level) ?? 0) + 1);
  }
  return MATURITY_LEVEL_LABELS.map((level) => {
    const count = counts.get(level) ?? 0;
    return { level, count, percentage: total === 0 ? 0 : Math.round((count / total) * 100) };
  });
}

export interface SectorAverage {
  industry: string; // "Unclassified" fallback for orgs with a null industry
  averageScore: number;
  count: number;
}

export function getSectorAverages(orgs: MockOrg[]): SectorAverage[] {
  const groups = new Map<string, number[]>();
  for (const org of orgs) {
    const key = org.industry ?? "Unclassified";
    const scores = groups.get(key) ?? [];
    scores.push(org.overallScore);
    groups.set(key, scores);
  }
  return Array.from(groups.entries())
    .map(([industry, scores]) => ({
      industry,
      averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      count: scores.length,
    }))
    .sort((a, b) => b.averageScore - a.averageScore);
}

export interface StateCount {
  state: string;
  count: number;
}

export function getTopStates(orgs: MockOrg[], limit = 5): StateCount[] {
  const counts = new Map<string, number>();
  for (const org of orgs) {
    const state = parseState(org.location);
    if (!state) continue; // excluded, not grouped as "Unclassified" — a location-derived list, unlike sector's own explicit fallback
    counts.set(state, (counts.get(state) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface MomentumEntry {
  org: MockOrg;
  trend: number;
  fromScore: number;
  toScore: number;
}

// Only orgs with scoreTrend defined — real pipeline orgs never have this
// yet (see mock-orgs.ts), so this quietly shrinks to nothing rather than
// fabricating momentum for orgs with no trend history, consistent with
// the rest of the app's honest-gap convention.
export function getMomentumLeaders(orgs: MockOrg[], limit = 5): MomentumEntry[] {
  return orgs
    .filter((o): o is MockOrg & { scoreTrend: number } => o.scoreTrend !== undefined)
    .sort((a, b) => b.scoreTrend - a.scoreTrend)
    .slice(0, limit)
    .map((org) => ({
      org,
      trend: org.scoreTrend,
      fromScore: Math.round((org.overallScore - org.scoreTrend) * 10) / 10,
      toScore: org.overallScore,
    }));
}

// Sorts independently rather than assuming the caller already sorted —
// same self-contained approach as every other aggregate here, so this
// component doesn't silently break if a caller's own sort order changes.
export function getTopPerformers(orgs: MockOrg[], limit = 5): MockOrg[] {
  return [...orgs].sort((a, b) => b.overallScore - a.overallScore).slice(0, limit);
}

// Lowest-scoring orgs — plain list, no color-severity coding. Framing is
// "needs attention" in prose/labels only, per the established rule that
// severity is never conveyed by color alone (see ScoreBadge).
export function getWatchlist(orgs: MockOrg[], limit = 5): MockOrg[] {
  return [...orgs].sort((a, b) => a.overallScore - b.overallScore).slice(0, limit);
}
