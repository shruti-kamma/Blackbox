import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// The candidate's own application history, across every job they've applied
// to — distinct from /api/candidate/matches, which is the feed of jobs they
// *could* apply to.
export async function GET() {
  try {
    const user = await requireRole("CANDIDATE");
    const applications = await prisma.application.findMany({
      where: { candidateId: user.candidateProfile!.id },
      orderBy: { updatedAt: "desc" },
      include: { job: { include: { organization: { select: { name: true } } } } },
    });
    return NextResponse.json({ applications });
  } catch (error) {
    return handleApiError(error);
  }
}
