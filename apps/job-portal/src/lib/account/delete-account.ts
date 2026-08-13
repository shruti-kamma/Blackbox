import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { deleteResumeFile } from "@/lib/resume-storage";

// Anonymizes a candidate's account in place rather than hard-deleting the
// row. Every foreign key touching CandidateProfile/User already cascades
// (confirmed by reading the schema, not assumed) — a literal delete would
// destroy things other parties have a legitimate stake in: an employer's
// own application/hiring record (not just the candidate's identity within
// it — the whole row would go), and the candidate's already-anonymized
// employer reviews, thinning out information other candidates rely on.
//
// Keeping the profile row alive means Application/Match/CandidateAssessment
// /EmployerReview all keep resolving correctly through their live relation
// to it — no changes needed there at all, since they'll now just read the
// scrubbed fields (fullName -> "Deleted candidate", etc.) automatically.
export async function deleteAccount(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { candidateProfile: true },
  });
  const profile = user.candidateProfile;
  if (!profile) throw new Error("deleteAccount called for a non-candidate account");

  // A real file, not something Prisma's transaction can roll back anyway —
  // done first, outside the DB transaction, same as the existing resume
  // DELETE route's ordering.
  if (profile.resumeUrl) {
    await deleteResumeFile(profile.id, profile.resumeUrl);
  }

  // Hashing a random, never-revealed UUID rather than nulling passwordHash
  // outright — keeps the column's NOT NULL invariant intact while making
  // the account genuinely unauthenticatable (no plaintext ever existed to
  // leak, and it can never be guessed).
  const unusablePasswordHash = await hashPassword(randomUUID());

  await prisma.$transaction([
    prisma.education.deleteMany({ where: { candidateProfileId: profile.id } }),
    prisma.workExperience.deleteMany({ where: { candidateProfileId: profile.id } }),
    prisma.project.deleteMany({ where: { candidateProfileId: profile.id } }),
    prisma.certification.deleteMany({ where: { candidateProfileId: profile.id } }),
    prisma.candidateSkill.deleteMany({ where: { candidateProfileId: profile.id } }),
    prisma.candidateAssistiveTechnology.deleteMany({ where: { candidateProfileId: profile.id } }),
    prisma.candidateDisabilityDetail.deleteMany({ where: { candidateProfileId: profile.id } }),
    prisma.verificationCode.deleteMany({ where: { userId } }),
    prisma.notification.deleteMany({ where: { userId } }),

    prisma.candidateProfile.update({
      where: { id: profile.id },
      data: {
        fullName: "Deleted candidate",
        headline: null,
        phone: null,
        phoneNormalized: null,
        dateOfBirth: null,
        resumeUrl: null,
        resumeFileName: null,
        accessibilityNeeds: [],
        disabilityCategories: [],
        disabilityOther: null,
        accommodationNeeds: [],
        confirmedNoAccommodationNeeds: false,
        preferredCommunicationModes: [],
        preferredCategories: [],
        preferredLocations: [],
        // Unlike the "keep everything that guards against rejoin abuse"
        // exceptions below, leaderboard opt-in has no such reason to
        // survive — leaving it true would show "Deleted candidate" ranked
        // among real names on a page other candidates browse.
        leaderboardOptIn: false,
        leaderboardOptInAt: null,
        // Deliberately NOT cleared: phoneVerifiedNormalized (CandidateProfile),
        // emailVerifiedNormalized (User, below), and disabilityCertHash —
        // these survive deletion specifically so a delete-and-rejoin cycle
        // can't be used to bypass the one-time assessment or the
        // duplicate-account rules (see Items 02/03). Nothing personal is
        // retained by keeping them — just the hash.
      },
    }),

    prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@deleted.blackboxjobs.local`,
        passwordHash: unusablePasswordHash,
        deletedAt: new Date(),
      },
    }),

    // `embedding` is an Unsupported("vector") column — Prisma Client has no
    // typed field for it at all, only reachable via raw SQL (same reason
    // the matching agent that populates it uses raw SQL too).
    prisma.$executeRaw`UPDATE "CandidateProfile" SET embedding = NULL WHERE id = ${profile.id}`,

    // Known, flagged limitation: a candidate's name gets copied as raw text
    // into an employer's own Notification.payload JSON (ACCOMMODATION_GAP /
    // GUARANTEED_INTERVIEW_SKIPPED), with no FK back to the candidate to
    // cascade or join on. This is a best-effort redaction matching on the
    // pre-scrub name — not a complete fix (a same-named different candidate
    // could theoretically collide, and any other PII shape embedded in a
    // payload elsewhere wouldn't be caught by this specific pattern). The
    // real fix is a bigger, separate cleanup: never embed PII in
    // notification payloads, resolve display data live by ID instead.
    prisma.$executeRaw`UPDATE "Notification" SET payload = jsonb_set(payload, '{candidateName}', '"Deleted candidate"') WHERE payload->>'candidateName' = ${profile.fullName}`,
  ]);
}
