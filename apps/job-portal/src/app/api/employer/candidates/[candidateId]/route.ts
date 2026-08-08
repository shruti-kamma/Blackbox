import { NextResponse } from "next/server";
import { ForbiddenError, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// Full candidate profile + resume data, for the employer-facing profile
// page — deliberately gated to candidates who've actually matched or
// applied to one of this employer's own jobs, not a way to browse every
// candidate on the platform.
export async function GET(request: Request, { params }: { params: Promise<{ candidateId: string }> }) {
  try {
    const user = await requireRole("EMPLOYER");
    const { candidateId } = await params;
    const organizationId = user.employerOrgId!;

    const [hasMatch, hasApplication] = await Promise.all([
      prisma.match.findFirst({ where: { candidateId, job: { organizationId } }, select: { id: true } }),
      prisma.application.findFirst({ where: { candidateId, job: { organizationId } }, select: { id: true } }),
    ]);
    if (!hasMatch && !hasApplication) {
      throw new ForbiddenError("This candidate hasn't matched or applied to any of your postings");
    }

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        education: true,
        workExperience: true,
        projects: true,
        certifications: true,
        skills: { include: { skill: true } },
        assistiveTechnologies: { include: { assistiveTechnology: true } },
        disabilityDetails: true,
        user: { select: { email: true } },
      },
    });
    if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    const [matches, applications] = await Promise.all([
      prisma.match.findMany({
        where: { candidateId, job: { organizationId } },
        orderBy: { score: "desc" },
        select: { score: true, job: { select: { id: true, title: true } } },
      }),
      prisma.application.findMany({
        where: { candidateId, job: { organizationId } },
        select: { status: true, job: { select: { id: true, title: true } } },
      }),
    ]);

    return NextResponse.json({
      candidate,
      email: candidate.user.email,
      matches: matches.map((m) => ({ score: m.score, jobId: m.job.id, jobTitle: m.job.title })),
      applications: applications.map((a) => ({ status: a.status, jobId: a.job.id, jobTitle: a.job.title })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
