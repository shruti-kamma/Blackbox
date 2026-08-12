import { getAllOrgsWithLatestScore, getOrgBySlugWithLatestScore, type RankingsOrg } from "@blackbox/db";
import {
  MOCK_ORGS,
  getOrgBySlug as getMockOrgBySlug,
  getOrgsSortedByScore as getMockOrgsSorted,
  type MockOrg,
} from "./mock-orgs";

// Single seam between the site and its data source. Tries Postgres first;
// falls back to the fictional MOCK_ORGS data (unreachable DB, or reachable
// but not loaded yet — see services/scoring-agent/scripts/load_scores.py)
// so local dev and the deployed site never hard-fail just because the
// pipeline hasn't populated real data yet. Warns once per process, not
// once per request, so logs don't flood.
let warnedFallback = false;
function warnFallback(err: unknown) {
  if (!warnedFallback) {
    console.warn(
      "[rankings] Could not reach Postgres, falling back to mock org data:",
      err instanceof Error ? err.message : err,
    );
    warnedFallback = true;
  }
}

function toMockOrgShape(row: RankingsOrg): MockOrg {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    industry: row.industry,
    location: row.location,
    logoUrl: row.logoUrl,
    description: row.description,
    overallScore: row.overallScore,
    verificationLevel: row.verificationLevel,
    methodologyVersion: row.methodologyVersion,
    generatedAt: row.generatedAt.toISOString(),
    breakdown: row.breakdown,
    // Presentational-only fields with no real data source yet — see the
    // MockOrg interface comment in mock-orgs.ts.
  };
}

export async function getAllOrgs(): Promise<MockOrg[]> {
  try {
    const rows = await getAllOrgsWithLatestScore();
    if (rows.length > 0) return rows.map(toMockOrgShape);
  } catch (err) {
    warnFallback(err);
    return getMockOrgsSorted();
  }
  // Reachable but empty (migrated, not yet loaded) — same fallback as a
  // connection failure, so the site never shows a blank leaderboard.
  return getMockOrgsSorted();
}

export async function getOrg(slug: string): Promise<MockOrg | undefined> {
  try {
    const row = await getOrgBySlugWithLatestScore(slug);
    if (row) return toMockOrgShape(row);
  } catch (err) {
    warnFallback(err);
    return getMockOrgBySlug(slug);
  }
  // Reachable, but this slug isn't a real org yet — check the mock set
  // too, so e.g. an old bookmarked mock URL doesn't just 404.
  return getMockOrgBySlug(slug) ?? undefined;
}

export { MOCK_ORGS };
