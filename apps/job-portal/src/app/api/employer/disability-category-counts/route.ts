import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { countCandidatesByDisabilityCategory } from "@/lib/candidate-counts";

// Platform-wide candidate count per disability category, for the "target
// disability categories" step of job posting — an employer can see how many
// candidates exist in a category right at the point of selecting it, rather
// than guessing or looking it up separately. Same reasoning as
// assistive-tech-insights: candidate-pool intelligence, not scoped to the
// employer's own org.
export async function GET() {
  try {
    await requireRole("EMPLOYER");

    const candidates = await prisma.candidateProfile.findMany({ select: { disabilityCategories: true } });
    const counts = countCandidatesByDisabilityCategory(candidates);

    return NextResponse.json({ counts });
  } catch (error) {
    return handleApiError(error);
  }
}
