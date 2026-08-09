import { NextResponse } from "next/server";
import { z } from "zod";
import { requireVerifiedCandidate, requireUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

const reviewInputSchema = z.object({
  // Null = "I didn't request any accommodations" — not the same as false
  // ("requested, wasn't honored"). The submission form forces a choice
  // among all three rather than defaulting to one.
  honoredAccommodations: z.boolean().nullable(),
  accessibleProcess: z.boolean(),
  comment: z.string().trim().max(1000).optional(),
});

// Public-ish read (any authenticated user, not employer-only) — candidates
// browsing jobs need this to inform where they apply, and an employer
// should be able to see their own aggregate too.
export async function GET(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const user = await requireUser();
    const { orgId } = await params;

    const reviews = await prisma.employerReview.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        candidateProfileId: true,
        honoredAccommodations: true,
        accessibleProcess: true,
        comment: true,
        createdAt: true,
      },
    });

    const accommodationAnswers = reviews.filter((r) => r.honoredAccommodations !== null);
    const accommodationsHonoredRate =
      accommodationAnswers.length > 0
        ? Math.round(
            (accommodationAnswers.filter((r) => r.honoredAccommodations === true).length /
              accommodationAnswers.length) *
              100,
          )
        : null;
    const accessibleProcessRate =
      reviews.length > 0
        ? Math.round((reviews.filter((r) => r.accessibleProcess).length / reviews.length) * 100)
        : null;

    const myReview =
      user.role === "CANDIDATE" && user.candidateProfile
        ? (reviews.find((r) => r.candidateProfileId === user.candidateProfile!.id) ?? null)
        : null;

    return NextResponse.json({
      aggregate: {
        reviewCount: reviews.length,
        accommodationsHonoredRate,
        accessibleProcessRate,
      },
      // Anonymized to anyone browsing — a candidate's own review is
      // identifiable to them via `myReview`, not by matching this list.
      reviews: reviews.map((r) => ({
        id: r.id,
        honoredAccommodations: r.honoredAccommodations,
        accessibleProcess: r.accessibleProcess,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      myReview,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const user = await requireVerifiedCandidate();
    const { orgId } = await params;
    const input = reviewInputSchema.parse(await request.json());
    const candidateId = user.candidateProfile!.id;

    // Gated to candidates with a real application on record — any status
    // counts, since even "applied and never heard back" is legitimate
    // experience of the employer's process.
    const hasApplied = await prisma.application.findFirst({
      where: { candidateId, job: { organizationId: orgId } },
      select: { id: true },
    });
    if (!hasApplied) {
      return NextResponse.json(
        { error: "You can only review employers you've applied to" },
        { status: 403 },
      );
    }

    const review = await prisma.employerReview.upsert({
      where: { organizationId_candidateProfileId: { organizationId: orgId, candidateProfileId: candidateId } },
      create: {
        organizationId: orgId,
        candidateProfileId: candidateId,
        honoredAccommodations: input.honoredAccommodations,
        accessibleProcess: input.accessibleProcess,
        comment: input.comment || null,
      },
      update: {
        honoredAccommodations: input.honoredAccommodations,
        accessibleProcess: input.accessibleProcess,
        comment: input.comment || null,
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
