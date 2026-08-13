import { NextResponse } from "next/server";
import { requireAssessedCandidate, requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// Opting in is the only way a candidate's real name and level reached
// become visible to other candidates (see GET /api/candidate/leaderboard).
// requireAssessedCandidate throws AssessmentRequiredError (handled as a
// 403 by handleApiError) for anyone without a completed assessment, since
// ranking is by level reached.
export async function POST() {
  try {
    const user = await requireAssessedCandidate();
    await prisma.candidateProfile.update({
      where: { id: user.candidateProfile!.id },
      data: { leaderboardOptIn: true, leaderboardOptInAt: new Date() },
    });
    return NextResponse.json({ leaderboardOptIn: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const user = await requireVerifiedCandidate();
    await prisma.candidateProfile.update({
      where: { id: user.candidateProfile!.id },
      data: { leaderboardOptIn: false, leaderboardOptInAt: null },
    });
    return NextResponse.json({ leaderboardOptIn: false });
  } catch (error) {
    return handleApiError(error);
  }
}
