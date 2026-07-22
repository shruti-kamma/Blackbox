import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { candidateProfileInputSchema } from "@/lib/validation/candidate-profile";
import { isMatchingSubstantialChange } from "@/lib/matching/change-detection";
import { enqueueMatchingJob } from "@/lib/queue/matching-queue";

const profileInclude = {
  education: true,
  workExperience: true,
  skills: { include: { skill: true } },
} as const;

export async function GET() {
  try {
    const user = await requireRole("CANDIDATE");
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: user.id },
      include: profileInclude,
    });
    return NextResponse.json({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireRole("CANDIDATE");
    const input = candidateProfileInputSchema.parse(await request.json());

    const before = await prisma.candidateProfile.findUnique({
      where: { userId: user.id },
      include: profileInclude,
    });
    if (!before) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.candidateProfile.update({
        where: { id: before.id },
        data: {
          fullName: input.fullName,
          headline: input.headline || null,
          resumeUrl: input.resumeUrl || null,
          accessibilityNeeds: input.accessibilityNeeds,
          disabilityCategories: input.disabilityCategories,
          disabilityOther: input.disabilityOther || null,
          experienceLevel: input.experienceLevel ?? null,
          preferredCategories: input.preferredCategories,
          preferredLocations: input.preferredLocations,
          openToRemote: input.openToRemote,
        },
      });

      await tx.education.deleteMany({ where: { candidateProfileId: before.id } });
      if (input.education.length > 0) {
        await tx.education.createMany({
          data: input.education.map((edu) => ({ ...edu, candidateProfileId: before.id })),
        });
      }

      await tx.workExperience.deleteMany({ where: { candidateProfileId: before.id } });
      if (input.workExperience.length > 0) {
        await tx.workExperience.createMany({
          data: input.workExperience.map((exp) => ({
            ...exp,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            candidateProfileId: before.id,
          })),
        });
      }

      await tx.candidateSkill.deleteMany({ where: { candidateProfileId: before.id } });
      for (const name of input.skills) {
        const skill = await tx.skill.upsert({ where: { name }, update: {}, create: { name } });
        await tx.candidateSkill.create({ data: { candidateProfileId: before.id, skillId: skill.id } });
      }
    });

    const substantial = isMatchingSubstantialChange(
      {
        disabilityCategories: before.disabilityCategories,
        experienceLevel: before.experienceLevel,
        preferredLocations: before.preferredLocations,
        openToRemote: before.openToRemote,
        education: before.education.map((e) => ({ level: e.level, fieldOfStudy: e.fieldOfStudy })),
        skills: before.skills.map((s) => s.skill.name),
      },
      {
        disabilityCategories: input.disabilityCategories,
        experienceLevel: input.experienceLevel ?? null,
        preferredLocations: input.preferredLocations,
        openToRemote: input.openToRemote,
        education: input.education.map((e) => ({ level: e.level, fieldOfStudy: e.fieldOfStudy ?? null })),
        skills: input.skills,
      },
    );

    if (substantial) {
      await enqueueMatchingJob({ type: "candidate-profile-updated", candidateProfileId: before.id });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { id: before.id },
      include: profileInclude,
    });
    return NextResponse.json({ profile, rematchTriggered: substantial });
  } catch (error) {
    return handleApiError(error);
  }
}
