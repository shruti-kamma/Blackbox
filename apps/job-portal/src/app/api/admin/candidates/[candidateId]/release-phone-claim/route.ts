import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// The escape hatch for the duplicate-account phone check: releases a
// candidate's phoneVerifiedNormalized claim (and resets phoneVerified, so
// they'll re-verify next time they need KYC) so support can resolve a
// genuine false positive — e.g. a shared household phone — rather than a
// candidate being permanently blocked from KYC with no recourse. Does not
// touch the other account that holds the conflicting claim; support
// resolves each side independently as needed.
export async function POST(request: Request, { params }: { params: Promise<{ candidateId: string }> }) {
  try {
    await requireRole("ADMIN");
    const { candidateId } = await params;

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      select: { id: true, userId: true },
    });
    if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.candidateProfile.update({
        where: { id: candidate.id },
        data: { phoneVerifiedNormalized: null },
      }),
      prisma.user.update({
        where: { id: candidate.userId },
        data: { phoneVerified: false },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
