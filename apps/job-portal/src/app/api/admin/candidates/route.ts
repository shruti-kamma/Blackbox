import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { computeProfileCompletion } from "@/lib/profile-completion";

// Every candidate, with enough rolled-up signal to see who's engaged
// (complete profile, getting matches, applying) vs. who's stalled out.
export async function GET() {
  try {
    await requireRole("ADMIN");

    const candidates = await prisma.candidateProfile.findMany({
      select: {
        id: true,
        fullName: true,
        headline: true,
        disabilityCategories: true,
        experienceLevel: true,
        preferredLocations: true,
        openToRemote: true,
        accommodationNeeds: true,
        confirmedNoAccommodationNeeds: true,
        createdAt: true,
        _count: { select: { education: true, workExperience: true, skills: true, matches: true, applications: true } },
        applications: { select: { status: true } },
        user: { select: { emailVerified: true, phoneVerified: true } },
        candidateAssessment: { select: { status: true, score: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = candidates.map((c) => {
      const { percent } = computeProfileCompletion({
        headline: c.headline,
        disabilityCategories: c.disabilityCategories,
        experienceLevel: c.experienceLevel,
        preferredLocations: c.preferredLocations,
        openToRemote: c.openToRemote,
        education: Array(c._count.education).fill(null),
        workExperience: Array(c._count.workExperience).fill(null),
        skills: Array(c._count.skills).fill(null),
        accommodationNeeds: c.accommodationNeeds,
        confirmedNoAccommodationNeeds: c.confirmedNoAccommodationNeeds,
      });

      return {
        id: c.id,
        fullName: c.fullName,
        disabilityCategories: c.disabilityCategories,
        profileCompletionPercent: percent,
        matchesCount: c._count.matches,
        applicationsCount: c._count.applications,
        hiresCount: c.applications.filter((a) => a.status === "OFFERED").length,
        signedUpAt: c.createdAt,
        kycVerified: c.user.emailVerified && c.user.phoneVerified,
        assessmentScore: c.candidateAssessment?.status === "COMPLETED" ? c.candidateAssessment.score : null,
      };
    });

    return NextResponse.json({ candidates: rows });
  } catch (error) {
    return handleApiError(error);
  }
}
