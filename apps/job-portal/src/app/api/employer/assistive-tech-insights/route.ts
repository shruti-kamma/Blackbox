import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { disabilityCategorySchema } from "@/lib/validation/candidate-profile";

// Aggregate, platform-wide insight for employers writing a job posting: for
// the disability categories they're targeting, which specific assistive
// technologies do candidates on the platform already use? Never scoped to
// their own org's applicants — this is candidate-pool intelligence, not a
// per-job or per-applicant view.
export async function GET(request: Request) {
  try {
    await requireRole("EMPLOYER");

    const url = new URL(request.url);
    const raw = url.searchParams.get("categories") ?? "";
    const categories = raw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => disabilityCategorySchema.parse(c));

    if (categories.length === 0) {
      return NextResponse.json({ insights: [] });
    }

    const rows = await prisma.candidateAssistiveTechnology.findMany({
      where: { candidateProfile: { disabilityCategories: { hasSome: categories } } },
      select: { assistiveTechnology: { select: { name: true } } },
    });

    const counts = new Map<string, number>();
    for (const row of rows) {
      const name = row.assistiveTechnology.name;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    const insights = [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ insights });
  } catch (error) {
    return handleApiError(error);
  }
}
