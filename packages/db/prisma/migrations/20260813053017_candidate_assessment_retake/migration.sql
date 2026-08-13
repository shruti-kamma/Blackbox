-- AlterTable
ALTER TABLE "CandidateAssessment" ADD COLUMN     "previousCompletedAt" TIMESTAMP(3),
ADD COLUMN     "previousScore" INTEGER,
ADD COLUMN     "retakeUsed" BOOLEAN NOT NULL DEFAULT false;
