-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "leaderboardOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leaderboardOptInAt" TIMESTAMP(3);
