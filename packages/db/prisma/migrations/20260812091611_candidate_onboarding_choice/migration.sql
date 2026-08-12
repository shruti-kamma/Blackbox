-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: candidates who already have real profile data (education,
-- skills, work experience, or a declared disability category) have clearly
-- already been through profile building — don't retroactively show them a
-- "how do you want to build your profile" choice screen they never asked
-- for. Only genuinely untouched profiles stay at the false default. Same
-- grandfathering reasoning as the KYC backfill in
-- 20260809104149_candidate_kyc_verification.
UPDATE "CandidateProfile" cp
SET "onboardingCompleted" = true
WHERE EXISTS (SELECT 1 FROM "Education" e WHERE e."candidateProfileId" = cp.id)
   OR EXISTS (SELECT 1 FROM "WorkExperience" w WHERE w."candidateProfileId" = cp.id)
   OR EXISTS (SELECT 1 FROM "CandidateSkill" cs WHERE cs."candidateProfileId" = cp.id)
   OR array_length(cp."disabilityCategories", 1) > 0;
