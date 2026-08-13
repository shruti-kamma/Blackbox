-- CreateEnum
CREATE TYPE "DuplicateFlagStatus" AS ENUM ('OPEN', 'DISMISSED', 'CONFIRMED_DUPLICATE');

-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "disabilityCertHash" TEXT,
ADD COLUMN     "disabilityVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disabilityVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DuplicateFlag" (
    "id" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "suspectedDuplicateOfId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DuplicateFlagStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "DuplicateFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DuplicateFlag_status_idx" ON "DuplicateFlag"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DuplicateFlag_candidateProfileId_suspectedDuplicateOfId_key" ON "DuplicateFlag"("candidateProfileId", "suspectedDuplicateOfId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_disabilityCertHash_key" ON "CandidateProfile"("disabilityCertHash");

-- AddForeignKey
ALTER TABLE "DuplicateFlag" ADD CONSTRAINT "DuplicateFlag_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuplicateFlag" ADD CONSTRAINT "DuplicateFlag_suspectedDuplicateOfId_fkey" FOREIGN KEY ("suspectedDuplicateOfId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
