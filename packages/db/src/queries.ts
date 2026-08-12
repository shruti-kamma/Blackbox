import { prisma } from "./index";

// Shape of one item in AccessibilityScore.breakdown (Json column) as
// produced by services/scoring-agent/scripts/score_orgs.py. Python emits
// snake_case; normalizeBreakdown below converts to the camelCase the TS
// side uses everywhere else.
interface RawBreakdownItem {
  category: string;
  subscore: number;
  industry_average?: number;
  rationale: string;
  recommendation: string | null;
}

export interface BreakdownItem {
  category: string;
  subscore: number;
  industryAverage: number;
  rationale: string;
  recommendation: string | null;
}

export interface RankingsOrg {
  id: string;
  slug: string;
  name: string;
  type: "COMPANY" | "UNIVERSITY";
  industry: string | null;
  location: string | null;
  logoUrl: string | null;
  description: string | null;
  overallScore: number;
  methodologyVersion: string;
  generatedAt: Date;
  breakdown: BreakdownItem[];
  // No claim/verification workflow exists yet (see docs/decisions.md —
  // "Score verification/trust ladder") — every org loaded from the
  // pipeline is accurately at level 0 until that's built, so this is a
  // real default, not a placeholder guess.
  verificationLevel: 0;
}

interface RawOrgRow {
  id: string;
  slug: string;
  name: string;
  type: "COMPANY" | "UNIVERSITY";
  industry: string | null;
  location: string | null;
  logoUrl: string | null;
  description: string | null;
  overallScore: number;
  methodologyVersion: string;
  generatedAt: Date;
  breakdown: unknown;
}

function normalizeBreakdown(raw: unknown): BreakdownItem[] {
  if (!Array.isArray(raw)) return [];
  return (raw as RawBreakdownItem[]).map((item) => ({
    category: item.category,
    subscore: item.subscore,
    industryAverage: item.industry_average ?? item.subscore,
    rationale: item.rationale,
    recommendation: item.recommendation ?? null,
  }));
}

function toRankingsOrg(row: RawOrgRow): RankingsOrg {
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
    methodologyVersion: row.methodologyVersion,
    generatedAt: row.generatedAt,
    breakdown: normalizeBreakdown(row.breakdown),
    verificationLevel: 0,
  };
}

// Prisma has no native "latest row per group" query — DISTINCT ON is
// Postgres-specific raw SQL, kept here as the one place both the
// leaderboard and detail page draw from (see docs/plans/rankings-site-v1.md).
// Filtering by org type happens in the caller (small result set — simpler
// and lower-risk than parameterizing the type into the raw SQL).
export async function getAllOrgsWithLatestScore(): Promise<RankingsOrg[]> {
  const rows = await prisma.$queryRaw<RawOrgRow[]>`
    SELECT DISTINCT ON (o.id)
      o.id, o.slug, o.name, o.type, o.industry, o.location, o."logoUrl", o.description,
      s."overallScore", s.breakdown, s."methodologyVersion", s."generatedAt"
    FROM "Organization" o
    JOIN "AccessibilityScore" s ON s."organizationId" = o.id
    ORDER BY o.id, s."generatedAt" DESC
  `;
  return rows.map(toRankingsOrg);
}

export async function getOrgBySlugWithLatestScore(slug: string): Promise<RankingsOrg | null> {
  const rows = await prisma.$queryRaw<RawOrgRow[]>`
    SELECT DISTINCT ON (o.id)
      o.id, o.slug, o.name, o.type, o.industry, o.location, o."logoUrl", o.description,
      s."overallScore", s.breakdown, s."methodologyVersion", s."generatedAt"
    FROM "Organization" o
    JOIN "AccessibilityScore" s ON s."organizationId" = o.id
    WHERE o.slug = ${slug}
    ORDER BY o.id, s."generatedAt" DESC
  `;
  const row = rows[0];
  return row ? toRankingsOrg(row) : null;
}
