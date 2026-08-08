import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// Every employer, with enough rolled-up activity to spot who's actually
// using the platform vs. who's gone quiet.
export async function GET() {
  try {
    await requireRole("ADMIN");

    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        jobs: {
          select: {
            isOpen: true,
            createdAt: true,
            offersGuaranteedInterview: true,
            applications: { select: { status: true, createdAt: true } },
          },
        },
        employerUsers: { select: { hrTrainedOnDisabilityHiring: true } },
      },
      orderBy: { name: "asc" },
    });

    const rows = organizations.map((org) => {
      const jobsCount = org.jobs.length;
      const openJobsCount = org.jobs.filter((j) => j.isOpen).length;
      const applications = org.jobs.flatMap((j) => j.applications);
      const applicationsCount = applications.length;
      const hiresCount = applications.filter((a) => a.status === "OFFERED").length;
      const activityDates = [
        org.createdAt,
        ...org.jobs.map((j) => j.createdAt),
        ...applications.map((a) => a.createdAt),
      ];
      const lastActivityAt = new Date(Math.max(...activityDates.map((d) => d.getTime())));
      const guaranteedInterviewJobsCount = org.jobs.filter((j) => j.offersGuaranteedInterview).length;
      const hrTeamSize = org.employerUsers.length;
      const hrRespondedCount = org.employerUsers.filter((u) => u.hrTrainedOnDisabilityHiring !== null).length;
      const hrTrainedCount = org.employerUsers.filter((u) => u.hrTrainedOnDisabilityHiring === true).length;

      return {
        id: org.id,
        name: org.name,
        type: org.type,
        jobsCount,
        openJobsCount,
        applicationsCount,
        hiresCount,
        lastActivityAt,
        guaranteedInterviewJobsCount,
        hrTeamSize,
        hrRespondedCount,
        hrTrainedCount,
      };
    });

    return NextResponse.json({ employers: rows });
  } catch (error) {
    return handleApiError(error);
  }
}
