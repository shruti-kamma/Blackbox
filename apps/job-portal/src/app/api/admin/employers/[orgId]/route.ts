import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    await requireRole("ADMIN");
    const { orgId } = await params;

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        type: true,
        website: true,
        createdAt: true,
        jobs: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            isOpen: true,
            createdAt: true,
            applications: { select: { id: true, status: true } },
          },
        },
      },
    });
    if (!organization) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const applications = await prisma.application.findMany({
      where: { job: { organizationId: orgId } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        matchScore: true,
        createdAt: true,
        candidate: { select: { id: true, fullName: true } },
        job: { select: { title: true } },
      },
    });

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
        website: organization.website,
        createdAt: organization.createdAt,
      },
      jobs: organization.jobs.map((j) => ({
        id: j.id,
        title: j.title,
        isOpen: j.isOpen,
        createdAt: j.createdAt,
        applicationsCount: j.applications.length,
        hiresCount: j.applications.filter((a) => a.status === "OFFERED").length,
      })),
      applications: applications.map((a) => ({
        id: a.id,
        status: a.status,
        matchScore: a.matchScore,
        createdAt: a.createdAt,
        candidateId: a.candidate.id,
        candidateName: a.candidate.fullName,
        jobTitle: a.job.title,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
