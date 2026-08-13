import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { computeProfileCompletion } from "@/lib/profile-completion";

export async function GET(request: Request, { params }: { params: Promise<{ candidateId: string }> }) {
  try {
    await requireRole("ADMIN");
    const { candidateId } = await params;

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        education: true,
        workExperience: true,
        skills: { include: { skill: true } },
        assistiveTechnologies: { include: { assistiveTechnology: true } },
        disabilityDetails: true,
        candidateAssessment: {
          select: {
            status: true,
            score: true,
            highestLevelReached: true,
            easyScore: true,
            mediumScore: true,
            hardScore: true,
            retakeUsed: true,
            previousScore: true,
            previousCompletedAt: true,
          },
        },
      },
    });
    if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    const { percent, nextBestAction } = computeProfileCompletion({
      headline: candidate.headline,
      disabilityCategories: candidate.disabilityCategories,
      experienceLevel: candidate.experienceLevel,
      preferredLocations: candidate.preferredLocations,
      openToRemote: candidate.openToRemote,
      education: candidate.education,
      workExperience: candidate.workExperience,
      skills: candidate.skills,
      accommodationNeeds: candidate.accommodationNeeds,
      confirmedNoAccommodationNeeds: candidate.confirmedNoAccommodationNeeds,
    });

    const [matches, applications] = await Promise.all([
      prisma.match.findMany({
        where: { candidateId },
        orderBy: { score: "desc" },
        select: {
          id: true,
          score: true,
          job: { select: { id: true, title: true, organization: { select: { name: true } } } },
        },
      }),
      prisma.application.findMany({
        where: { candidateId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          matchScore: true,
          createdAt: true,
          job: { select: { id: true, title: true, organization: { select: { name: true } } } },
        },
      }),
    ]);

    return NextResponse.json({
      candidate,
      profileCompletionPercent: percent,
      nextBestAction,
      matches: matches.map((m) => ({
        id: m.id,
        score: m.score,
        jobId: m.job.id,
        jobTitle: m.job.title,
        organizationName: m.job.organization.name,
      })),
      applications: applications.map((a) => ({
        id: a.id,
        status: a.status,
        matchScore: a.matchScore,
        createdAt: a.createdAt,
        jobId: a.job.id,
        jobTitle: a.job.title,
        organizationName: a.job.organization.name,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
