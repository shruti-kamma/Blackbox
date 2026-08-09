import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// A candidate-only action: pull an application out of the pipeline. Distinct
// from the employer's PATCH on /api/jobs/[jobId]/applications/[applicationId],
// which can only move an application forward, never withdraw it.
export async function POST(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const user = await requireVerifiedCandidate();
    const { applicationId } = await params;

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application || application.candidateId !== user.candidateProfile!.id) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    if (application.status === "REJECTED" || application.status === "WITHDRAWN") {
      return NextResponse.json({ error: "This application is already closed" }, { status: 409 });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: "WITHDRAWN" },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
