import { prisma } from "@/lib/db";

// Same normalization as the backfill in the migration that introduced
// Organization.slug (packages/db/prisma/migrations/
// 20260812101111_add_rankings_org_fields_and_evidence) — lowercase,
// non-alphanumeric runs collapsed to one hyphen, trimmed.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// New employer signups create an Organization on the fly (see
// api/auth/signup/route.ts) — unlike the one-time migration backfill, a
// collision here is checked against real-time data, so this queries first
// rather than assuming uniqueness.
export async function uniqueOrgSlug(name: string): Promise<string> {
  const base = slugify(name) || "org";
  let candidate = base;
  let suffix = 2;
  while (await prisma.organization.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
