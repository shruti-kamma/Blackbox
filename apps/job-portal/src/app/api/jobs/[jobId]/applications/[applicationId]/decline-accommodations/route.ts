import { NextResponse } from "next/server";
import { ForbiddenError, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { computeAccommodationGap, computeFirstTimeMissingAccommodations } from "@/lib/matching/accommodation-gap";
import { ACCOMMODATION_TYPE_OPTIONS } from "@/lib/matching-options";

const ACCOMMODATION_LABELS = Object.fromEntries(
  ACCOMMODATION_TYPE_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

// The "No" side of the accommodation gate — a single, terminal action, not a
// retry candidate the way "Yes" is. Recomputes the gap fresh rather than
// trusting anything the client sent, so the recorded reason is accurate.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string; applicationId: string }> },
) {
  try {
    const user = await requireRole("EMPLOYER");
    const { jobId, applicationId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { organizationId: true, accommodationTypes: true },
    });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.organizationId !== user.employerOrgId) throw new ForbiddenError();

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { candidate: { select: { accommodationNeeds: true } } },
    });
    if (!application || application.jobId !== jobId) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const pastApprovals = await prisma.application.findMany({
      where: {
        job: { organizationId: job.organizationId },
        accommodationsApprovedAt: { not: null },
        id: { not: applicationId },
      },
      select: { candidate: { select: { accommodationNeeds: true } } },
    });
    const everProvided = pastApprovals.flatMap((a) => a.candidate.accommodationNeeds);
    const missing = computeAccommodationGap(application.candidate.accommodationNeeds, job.accommodationTypes);
    const firstTimeMissing = computeFirstTimeMissingAccommodations(missing, everProvided);

    const labels = firstTimeMissing.map((v) => ACCOMMODATION_LABELS[v] ?? v);
    const reason =
      labels.length > 0
        ? `Unable to provide: ${labels.join(", ")}`
        : "Unable to meet the candidate's accommodation needs";

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: "REJECTED", rejectionReason: reason },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
