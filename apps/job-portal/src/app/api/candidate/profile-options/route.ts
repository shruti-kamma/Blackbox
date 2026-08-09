import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { SEED_INSTITUTIONS } from "@/lib/institution-seed";

const FIELDS = ["skills", "categories", "locations", "institutions", "fieldsOfStudy"] as const;
type Field = (typeof FIELDS)[number];

const MAX_RESULTS = 20;

// Every option list here is derived from real, already-submitted data
// (Skill rows, Job postings, other candidates' Education rows). Institutions
// also gets a static starter seed (see institution-seed.ts) so search isn't
// empty on day one; everything else grows purely from submissions. Typing a
// genuinely new value and saving it is what grows the pool for the next
// person to search: no separate "add to vocabulary" step needed for
// anything except skills, which already had a structured upsert-by-name
// table (see PUT /api/candidate/profile).
async function suggestionsFor(field: Field, query: string): Promise<string[]> {
  if (field === "skills") {
    const rows = await prisma.skill.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: MAX_RESULTS,
      select: { name: true },
    });
    return rows.map((r) => r.name);
  }

  if (field === "categories") {
    // Two sources, same reasoning as locations below: categories employers
    // have posted jobs under, plus categories other candidates have already
    // typed as their preference — otherwise a candidate's own "Other" entry
    // would never resurface for the next candidate searching this field.
    const [jobCategories, candidateCategories] = await Promise.all([
      prisma.job.findMany({
        where: { category: { contains: query, mode: "insensitive" } },
        distinct: ["category"],
        take: MAX_RESULTS,
        select: { category: true },
      }),
      prisma.$queryRaw<{ cat: string }[]>`
        SELECT DISTINCT cat FROM (
          SELECT unnest("preferredCategories") AS cat FROM "CandidateProfile"
        ) t
        WHERE cat ILIKE ${"%" + query + "%"}
        LIMIT ${MAX_RESULTS}
      `,
    ]);
    const combined = new Set<string>();
    for (const j of jobCategories) combined.add(j.category);
    for (const c of candidateCategories) combined.add(c.cat);
    return Array.from(combined).sort().slice(0, MAX_RESULTS);
  }

  if (field === "institutions") {
    // Real candidate submissions first, topped up with a static seed list of
    // well-known Indian colleges/universities (see institution-seed.ts) so
    // search isn't empty before real submissions build up the pool.
    const rows = await prisma.education.findMany({
      where: { institution: { contains: query, mode: "insensitive" } },
      distinct: ["institution"],
      take: MAX_RESULTS,
      select: { institution: true },
    });
    const combined = new Set<string>(rows.map((r) => r.institution));
    const lowerQuery = query.toLowerCase();
    for (const seed of SEED_INSTITUTIONS) {
      if (combined.size >= MAX_RESULTS) break;
      if (seed.toLowerCase().includes(lowerQuery)) combined.add(seed);
    }
    return Array.from(combined).sort().slice(0, MAX_RESULTS);
  }

  if (field === "fieldsOfStudy") {
    const rows = await prisma.education.findMany({
      where: { fieldOfStudy: { contains: query, mode: "insensitive", not: null } },
      distinct: ["fieldOfStudy"],
      orderBy: { fieldOfStudy: "asc" },
      take: MAX_RESULTS,
      select: { fieldOfStudy: true },
    });
    return rows.map((r) => r.fieldOfStudy).filter((v): v is string => v !== null);
  }

  // locations: two sources — jobs employers have posted to, and locations
  // other candidates have already listed (a plain string[] column, so it
  // needs a raw unnest rather than Prisma's `distinct`).
  const [jobLocations, candidateLocations] = await Promise.all([
    prisma.job.findMany({
      where: { location: { contains: query, mode: "insensitive" } },
      distinct: ["location"],
      take: MAX_RESULTS,
      select: { location: true },
    }),
    prisma.$queryRaw<{ loc: string }[]>`
      SELECT DISTINCT loc FROM (
        SELECT unnest("preferredLocations") AS loc FROM "CandidateProfile"
      ) t
      WHERE loc ILIKE ${"%" + query + "%"}
      LIMIT ${MAX_RESULTS}
    `,
  ]);
  const combined = new Set<string>();
  for (const j of jobLocations) if (j.location) combined.add(j.location);
  for (const c of candidateLocations) combined.add(c.loc);
  return Array.from(combined).sort().slice(0, MAX_RESULTS);
}

export async function GET(request: Request) {
  try {
    await requireVerifiedCandidate();
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const query = searchParams.get("q")?.trim() ?? "";

    if (!field || !FIELDS.includes(field as Field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const options = await suggestionsFor(field as Field, query);
    return NextResponse.json({ options });
  } catch (error) {
    return handleApiError(error);
  }
}
