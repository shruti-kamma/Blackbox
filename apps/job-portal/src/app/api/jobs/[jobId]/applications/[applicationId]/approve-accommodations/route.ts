import { NextResponse } from "next/server";
import { ForbiddenError, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// The explicit action that unblocks the OFFERED gate in
// /api/jobs/[jobId]/applications/[applicationId] — an employer confirming
// they can meet a first-time accommodation need. No body: this is a
// deliberate yes/no action, not a form.
export async function POST(request: Request, { params }: { params: Promise<{ jobId: string; applicationId: string }> }) {
  try {
    const user = await requireRole("EMPLOYER");
    const { jobId, applicationId } = await params;

    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { organizationId: true } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.organizationId !== user.employerOrgId) throw new ForbiddenError();

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application || application.jobId !== jobId) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { accommodationsApprovedAt: new Date(), accommodationsApprovedByUserId: user.id },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
