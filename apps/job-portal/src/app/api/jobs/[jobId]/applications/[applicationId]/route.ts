import { NextResponse } from "next/server";
import { z } from "zod";
import { ForbiddenError, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { EMPLOYER_ASSIGNABLE_STATUSES } from "@/lib/application-status";

const updateStatusSchema = z.object({
  status: z.enum(EMPLOYER_ASSIGNABLE_STATUSES as [string, ...string[]]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string; applicationId: string }> },
) {
  try {
    const user = await requireRole("EMPLOYER");
    const { jobId, applicationId } = await params;
    const { status } = updateStatusSchema.parse(await request.json());

    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { organizationId: true } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.organizationId !== user.employerOrgId) throw new ForbiddenError();

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application || application.jobId !== jobId) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: status as (typeof EMPLOYER_ASSIGNABLE_STATUSES)[number] },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
