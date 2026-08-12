import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// Marks the first-time "autofill vs. manual" choice screen as done, the
// moment a candidate picks either path — not on full profile completion.
// Leaving the form half-filled afterward should never re-show the choice
// screen on their next visit.
export async function POST() {
  try {
    const user = await requireVerifiedCandidate();
    await prisma.candidateProfile.update({
      where: { id: user.candidateProfile!.id },
      data: { onboardingCompleted: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
