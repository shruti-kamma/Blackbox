import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// The moderation safety valve for employer reviews: no pre-publish approval
// queue (reviews go live immediately), but an admin can remove one after
// the fact if it's abusive or clearly unfair. Deliberately minimal — no
// review-status workflow, no appeals process, just a delete.
export async function DELETE(request: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    await requireRole("ADMIN");
    const { reviewId } = await params;
    await prisma.employerReview.delete({ where: { id: reviewId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
