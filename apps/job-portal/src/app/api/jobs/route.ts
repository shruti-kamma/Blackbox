import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { jobInputSchema } from "@/lib/validation/job";
import { enqueueMatchingJob } from "@/lib/queue/matching-queue";

// Employer's own postings list (not the candidate feed — candidates only
// ever see jobs via their stored Match rows, see /api/candidate/matches).
export async function GET() {
  try {
    const user = await requireRole("EMPLOYER");
    const jobs = await prisma.job.findMany({
      where: { organizationId: user.employerOrgId! },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true, matches: true } } },
    });
    return NextResponse.json({ jobs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("EMPLOYER");
    if (!user.employerOrgId) {
      return NextResponse.json({ error: "No organization associated with this account" }, { status: 400 });
    }
    const input = jobInputSchema.parse(await request.json());

    const job = await prisma.$transaction(async (tx) => {
      const created = await tx.job.create({
        data: {
          organizationId: user.employerOrgId!,
          title: input.title,
          description: input.description,
          category: input.category,
          location: input.location || null,
          remote: input.remote,
          employmentType: input.employmentType || null,
          accommodationsOffered: input.accommodationsOffered,
          targetDisabilityCategories: input.targetDisabilityCategories,
          requiredEducationLevel: input.requiredEducationLevel ?? null,
          requiredEducationField: input.requiredEducationField || null,
          requiredExperienceLevel: input.requiredExperienceLevel ?? null,
        },
      });

      for (const name of input.requiredSkills) {
        const skill = await tx.skill.upsert({ where: { name }, update: {}, create: { name } });
        await tx.jobSkill.create({ data: { jobId: created.id, skillId: skill.id } });
      }

      return created;
    });

    // Enqueue and return immediately — matching runs asynchronously in the
    // worker (src/worker), never inside this request.
    await enqueueMatchingJob({ type: "job-posted", jobId: job.id });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
