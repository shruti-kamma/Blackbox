import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { computeProfileCompletion } from "@/lib/profile-completion";
import type { AssessmentDifficulty } from "@blackbox/db";

// Ranked by level reached, not raw score — candidates with different
// disability categories and different AI-generated skill questions are
// often literally answering different tests, so raw score can't fairly
// compare them (see tracker Item 07). Tie-broken by profile completeness.
const LEVEL_RANK: Record<AssessmentDifficulty, number> = { HARD: 3, MEDIUM: 2, EASY: 1 };

export async function GET() {
  try {
    const user = await requireVerifiedCandidate();

    const [entrants, viewerAssessment] = await Promise.all([
      prisma.candidateProfile.findMany({
        where: { leaderboardOptIn: true },
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
          _count: { select: { education: true, workExperience: true, skills: true } },
          candidateAssessment: { select: { highestLevelReached: true } },
        },
      }),
      prisma.candidateAssessment.findUnique({
        where: { candidateProfileId: user.candidateProfile!.id },
        select: { status: true },
      }),
    ]);

    const ranked = entrants
      // Opting in requires a completed assessment (enforced at write time
      // in POST /api/candidate/leaderboard/opt-in), so highestLevelReached
      // is always set here — this filter only guards against an entrant
      // who opted in and then used their retake, which briefly flips
      // status back to IN_PROGRESS without clearing highestLevelReached.
      .filter((c) => c.candidateAssessment?.highestLevelReached)
      .map((c) => {
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
          level: c.candidateAssessment!.highestLevelReached as AssessmentDifficulty,
          percent,
        };
      })
      .sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level] || b.percent - a.percent)
      .map((entry, i) => ({
        rank: i + 1,
        id: entry.id,
        fullName: entry.fullName,
        level: entry.level,
        isYou: entry.id === user.candidateProfile!.id,
      }));

    return NextResponse.json({
      entries: ranked,
      viewerOptedIn: ranked.some((e) => e.isYou),
      viewerAssessmentCompleted: viewerAssessment?.status === "COMPLETED",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
