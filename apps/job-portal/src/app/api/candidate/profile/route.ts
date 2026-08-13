import { NextResponse } from "next/server";
import type { AssistiveTechnologyType } from "@blackbox/db";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { candidateProfileInputSchema } from "@/lib/validation/candidate-profile";
import { isMatchingSubstantialChange } from "@/lib/matching/change-detection";
import { enqueueMatchingJob } from "@/lib/queue/matching-queue";
import { SEED_ASSISTIVE_TECHNOLOGIES } from "@/lib/assistive-technology-seed";
import { normalizePhone } from "@/lib/kyc/normalize";

const SEED_ASSISTIVE_TECH_TYPE_BY_NAME = new Map(
  SEED_ASSISTIVE_TECHNOLOGIES.map((t) => [t.name.toLowerCase(), t.type]),
);

const profileInclude = {
  education: true,
  workExperience: true,
  projects: true,
  certifications: true,
  skills: { include: { skill: true } },
  assistiveTechnologies: { include: { assistiveTechnology: true } },
  disabilityDetails: true,
} as const;

export async function GET() {
  try {
    const user = await requireVerifiedCandidate();
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
    const user = await requireVerifiedCandidate();
    const input = candidateProfileInputSchema.parse(await request.json());

    const before = await prisma.candidateProfile.findUnique({
      where: { userId: user.id },
      include: profileInclude,
    });
    if (!before) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    // requireVerifiedCandidate() already guarantees phoneVerified is true
    // for anyone reaching this route — so a genuine change to a different
    // number always needs the reset, never a conditional check. Reusing
    // the exact normalize logic KYC verification writes, so the two stay
    // comparable.
    //
    // A blank submission is deliberately NOT treated as "clear the phone"
    // — the phone field has no `required` attribute in the form, and
    // there's no explicit "remove my phone" affordance the way résumé
    // removal has its own button. Treating blank as a real change would
    // reset phoneVerified, and since every route past this one (including
    // this one) requires phoneVerified, a candidate who blanked the field
    // by accident would have no way back in to re-add a number. Blank is
    // "no intended change," full stop.
    const phoneSubmitted = Boolean(input.phone);
    const newPhoneNormalized = phoneSubmitted ? normalizePhone(input.phone!) : before.phoneNormalized;
    const phoneChanged = phoneSubmitted && newPhoneNormalized !== before.phoneNormalized;

    await prisma.$transaction(async (tx) => {
      await tx.candidateProfile.update({
        where: { id: before.id },
        data: {
          fullName: input.fullName,
          headline: input.headline || null,
          ...(phoneSubmitted ? { phone: input.phone, phoneNormalized: newPhoneNormalized } : {}),
          ...(phoneChanged ? { phoneVerifiedNormalized: null } : {}),
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          // resumeUrl / resumeFileName are intentionally not written here —
          // they're only ever set by POST /api/candidate/resume-upload.
          accessibilityNeeds: input.accessibilityNeeds,
          disabilityCategories: input.disabilityCategories,
          disabilityOther: input.disabilityOther || null,
          accommodationNeeds: input.accommodationNeeds,
          confirmedNoAccommodationNeeds: input.confirmedNoAccommodationNeeds,
          preferredCommunicationModes: input.preferredCommunicationModes,
          experienceLevel: input.experienceLevel ?? null,
          preferredCategories: input.preferredCategories,
          preferredLocations: input.preferredLocations,
          openToRemote: input.openToRemote,
        },
      });

      if (phoneChanged) {
        await tx.user.update({ where: { id: user.id }, data: { phoneVerified: false } });
      }

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

      await tx.project.deleteMany({ where: { candidateProfileId: before.id } });
      if (input.projects.length > 0) {
        await tx.project.createMany({
          data: input.projects.map((p) => ({
            title: p.title,
            subtitle: p.subtitle || null,
            techStack: p.techStack || null,
            date: p.date ? new Date(p.date) : null,
            description: p.description || null,
            url: p.url || null,
            candidateProfileId: before.id,
          })),
        });
      }

      await tx.certification.deleteMany({ where: { candidateProfileId: before.id } });
      if (input.certifications.length > 0) {
        await tx.certification.createMany({
          data: input.certifications.map((c) => ({
            title: c.title,
            issuer: c.issuer || null,
            date: c.date ? new Date(c.date) : null,
            url: c.url || null,
            candidateProfileId: before.id,
          })),
        });
      }

      await tx.candidateSkill.deleteMany({ where: { candidateProfileId: before.id } });
      for (const name of input.skills) {
        const skill = await tx.skill.upsert({ where: { name }, update: {}, create: { name } });
        await tx.candidateSkill.create({ data: { candidateProfileId: before.id, skillId: skill.id } });
      }

      await tx.candidateAssistiveTechnology.deleteMany({ where: { candidateProfileId: before.id } });
      for (const name of input.assistiveTechnologies) {
        // A name matching the seed list (picked from search suggestions)
        // gets its real device type on creation; a genuinely new,
        // candidate-typed name — the "Other" fallback — still defaults to
        // OTHER until re-categorized.
        const seedType = SEED_ASSISTIVE_TECH_TYPE_BY_NAME.get(name.toLowerCase());
        const tech = await tx.assistiveTechnology.upsert({
          where: { name },
          update: {},
          create: { name, type: (seedType ?? "OTHER") as AssistiveTechnologyType },
        });
        await tx.candidateAssistiveTechnology.create({
          data: { candidateProfileId: before.id, assistiveTechnologyId: tech.id },
        });
      }

      await tx.candidateDisabilityDetail.deleteMany({ where: { candidateProfileId: before.id } });
      if (input.disabilityDetails.length > 0) {
        await tx.candidateDisabilityDetail.createMany({
          data: input.disabilityDetails.map((d) => ({
            candidateProfileId: before.id,
            category: d.category,
            severityPercentage: d.severityPercentage ?? null,
            affectedBodyPart: d.affectedBodyPart ?? null,
          })),
        });
      }
    });

    const substantial = isMatchingSubstantialChange(
      {
        disabilityCategories: before.disabilityCategories,
        accommodationNeeds: before.accommodationNeeds,
        assistiveTechnologies: before.assistiveTechnologies.map((a) => a.assistiveTechnology.name),
        experienceLevel: before.experienceLevel,
        preferredLocations: before.preferredLocations,
        openToRemote: before.openToRemote,
        education: before.education.map((e) => ({ level: e.level, fieldOfStudy: e.fieldOfStudy })),
        skills: before.skills.map((s) => s.skill.name),
      },
      {
        disabilityCategories: input.disabilityCategories,
        accommodationNeeds: input.accommodationNeeds,
        assistiveTechnologies: input.assistiveTechnologies,
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
