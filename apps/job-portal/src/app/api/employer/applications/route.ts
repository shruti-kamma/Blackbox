import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// Org-wide application activity — powers the employer landing dashboard's
// pipeline stats, aggregated across every job rather than scoped to one.
export async function GET() {
  try {
    const user = await requireRole("EMPLOYER");
    const applications = await prisma.application.findMany({
      where: { job: { organizationId: user.employerOrgId! } },
      select: { id: true, status: true, jobId: true, job: { select: { title: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ applications });
  } catch (error) {
    return handleApiError(error);
  }
}
