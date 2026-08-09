import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { computeAtsScore } from "@/lib/ats-score";

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireVerifiedCandidate();
    const { jobId } = await params;

    const [candidate, job] = await Promise.all([
      prisma.candidateProfile.findUnique({
        where: { userId: user.id },
        select: {
          experienceLevel: true,
          education: { select: { level: true } },
          skills: { select: { skill: { select: { name: true } } } },
        },
      }),
      prisma.job.findUnique({
        where: { id: jobId },
        select: {
          requiredEducationLevel: true,
          requiredExperienceLevel: true,
          requiredSkills: { select: { skill: { select: { name: true } } } },
        },
      }),
    ]);
    if (!candidate) return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const result = computeAtsScore(
      {
        skills: candidate.skills.map((s) => s.skill.name),
        education: candidate.education,
        experienceLevel: candidate.experienceLevel,
      },
      {
        requiredSkills: job.requiredSkills.map((s) => s.skill.name),
        requiredEducationLevel: job.requiredEducationLevel,
        requiredExperienceLevel: job.requiredExperienceLevel,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
