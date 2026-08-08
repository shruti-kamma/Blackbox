import { NextResponse } from "next/server";
import { z } from "zod";
import { ForbiddenError, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { EMPLOYER_ASSIGNABLE_STATUSES } from "@/lib/application-status";
import { computeAccommodationGap, computeFirstTimeMissingAccommodations } from "@/lib/matching/accommodation-gap";

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

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { organizationId: true, accommodationTypes: true },
    });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.organizationId !== user.employerOrgId) throw new ForbiddenError();

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { candidate: { select: { fullName: true, accommodationNeeds: true } } },
    });
    if (!application || application.jobId !== jobId) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // The gate fires on HR's *first* move off Submitted, whichever status
    // they pick — not tied to a specific stage like Interviewing or Offered,
    // since the dropdown doesn't enforce linear progression. "First time" is
    // scoped per organization: if this org has explicitly approved the need
    // before (for any other application — approval, not Offered status, is
    // the precedent signal since resolution now happens this early), it's
    // not novel and doesn't block again.
    const isFirstMoveOffSubmitted =
      application.status === "SUBMITTED" && status !== "REJECTED" && status !== "WITHDRAWN";
    if (isFirstMoveOffSubmitted && !application.accommodationsApprovedAt) {
      const missing = computeAccommodationGap(application.candidate.accommodationNeeds, job.accommodationTypes);
      if (missing.length > 0) {
        const pastApprovals = await prisma.application.findMany({
          where: {
            job: { organizationId: job.organizationId },
            accommodationsApprovedAt: { not: null },
            id: { not: applicationId },
          },
          select: { candidate: { select: { accommodationNeeds: true } } },
        });
        const everProvided = pastApprovals.flatMap((a) => a.candidate.accommodationNeeds);
        const firstTimeMissing = computeFirstTimeMissingAccommodations(missing, everProvided);
        if (firstTimeMissing.length > 0) {
          const alreadyNotified = await prisma.notification.findFirst({
            where: { type: "ACCOMMODATION_GAP", payload: { path: ["applicationId"], equals: applicationId } },
          });
          if (!alreadyNotified) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                type: "ACCOMMODATION_GAP",
                payload: {
                  applicationId,
                  jobId,
                  candidateId: application.candidateId,
                  candidateName: application.candidate.fullName,
                  missingAccommodations: firstTimeMissing,
                },
              },
            });
          }
          return NextResponse.json(
            {
              error: `This candidate needs ${firstTimeMissing.join(", ")}, which your organization hasn't confirmed providing before. Confirm whether you can provide this before moving them forward.`,
              needsAccommodationApproval: true,
              missingAccommodations: firstTimeMissing,
            },
            { status: 409 },
          );
        }
      }
    }

    // The guaranteed-interview badge's accountability signal: this is the
    // one moment the "before" status is still known, so it's the only
    // reliable point to detect a skip — Application doesn't keep status
    // history, so this can't be reconstructed after the fact. Informational
    // only, same as ACCOMMODATION_GAP — never blocks the transition, since a
    // single instance can have a legitimate reason.
    const isSkippingGuaranteedInterview =
      application.metEssentialCriteria &&
      (application.status === "SUBMITTED" || application.status === "UNDER_REVIEW") &&
      status === "REJECTED";
    if (isSkippingGuaranteedInterview) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "GUARANTEED_INTERVIEW_SKIPPED",
          payload: {
            applicationId,
            jobId,
            candidateName: application.candidate.fullName,
          },
        },
      });
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
