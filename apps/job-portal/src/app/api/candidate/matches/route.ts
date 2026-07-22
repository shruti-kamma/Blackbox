import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// The candidate's personalized job feed — reads only from the stored Match
// table, never the raw Job list. A job only appears here once the async
// matching worker has scored it above the threshold.
export async function GET() {
  try {
    const user = await requireRole("CANDIDATE");
    const matches = await prisma.match.findMany({
      where: { candidateId: user.candidateProfile!.id },
      orderBy: { score: "desc" },
      include: { job: { include: { organization: { select: { name: true } } } } },
    });

    const applications = await prisma.application.findMany({
      where: { candidateId: user.candidateProfile!.id },
      select: { jobId: true, status: true },
    });
    const applicationByJobId = new Map(applications.map((a) => [a.jobId, a.status]));

    return NextResponse.json({
      matches: matches.map((m) => ({
        ...m,
        applicationStatus: applicationByJobId.get(m.jobId) ?? null,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
