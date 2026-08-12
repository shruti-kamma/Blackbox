import { NextResponse } from "next/server";
import { getCurrentUser, ForbiddenError } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { ALLOWED_RESUME_TYPES, readResumeFile } from "@/lib/resume-storage";

const MIME_BY_EXTENSION = Object.fromEntries(
  Object.entries(ALLOWED_RESUME_TYPES).map(([mime, ext]) => [ext, mime]),
);

// Streams the candidate's own uploaded resume file. Gated to: the candidate
// themselves, an employer who has this candidate matched or applied to one
// of their postings (same gate as the full profile view — see
// /api/employer/candidates/[candidateId]), or admin.
export async function GET(request: Request, { params }: { params: Promise<{ candidateProfileId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { candidateProfileId } = await params;

    if (user.role === "CANDIDATE") {
      if (user.candidateProfile?.id !== candidateProfileId) {
        throw new ForbiddenError("You can only view your own resume");
      }
    } else if (user.role === "EMPLOYER") {
      const organizationId = user.employerOrgId!;
      const [hasMatch, hasApplication] = await Promise.all([
        prisma.match.findFirst({
          where: { candidateId: candidateProfileId, job: { organizationId } },
          select: { id: true },
        }),
        prisma.application.findFirst({
          where: { candidateId: candidateProfileId, job: { organizationId } },
          select: { id: true },
        }),
      ]);
      if (!hasMatch && !hasApplication) {
        throw new ForbiddenError("This candidate hasn't matched or applied to any of your postings");
      }
    } else if (user.role !== "ADMIN") {
      throw new ForbiddenError("Not permitted");
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { id: candidateProfileId },
      select: { resumeUrl: true, resumeFileName: true },
    });
    if (!profile?.resumeUrl) {
      return NextResponse.json({ error: "No resume uploaded" }, { status: 404 });
    }

    const bytes = await readResumeFile(candidateProfileId, profile.resumeUrl);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": MIME_BY_EXTENSION[profile.resumeUrl] ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${(profile.resumeFileName ?? "resume").replace(/"/g, "")}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
