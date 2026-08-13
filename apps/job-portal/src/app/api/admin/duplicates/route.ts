import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// The review queue for soft duplicate-account signals — today only
// populated by a matching disability-certificate hash (see
// api/candidate/disability-verification), a much stronger signal than
// name/DOB matching. Never auto-acted on; an admin resolves each one.
export async function GET() {
  try {
    await requireRole("ADMIN");

    const flags = await prisma.duplicateFlag.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        candidateProfile: { select: { id: true, fullName: true, user: { select: { email: true } } } },
        suspectedDuplicateOf: { select: { id: true, fullName: true, user: { select: { email: true } } } },
      },
    });

    return NextResponse.json({
      flags: flags.map((f) => ({
        id: f.id,
        reason: f.reason,
        createdAt: f.createdAt,
        candidate: { id: f.candidateProfile.id, fullName: f.candidateProfile.fullName, email: f.candidateProfile.user.email },
        suspectedDuplicateOf: {
          id: f.suspectedDuplicateOf.id,
          fullName: f.suspectedDuplicateOf.fullName,
          email: f.suspectedDuplicateOf.user.email,
        },
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
