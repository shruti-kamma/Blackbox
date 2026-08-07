-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "confirmedNoAccommodationNeeds" BOOLEAN NOT NULL DEFAULT false;
