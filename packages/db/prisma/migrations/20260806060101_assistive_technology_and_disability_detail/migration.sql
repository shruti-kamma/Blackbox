-- CreateEnum
CREATE TYPE "AssistiveTechnologyType" AS ENUM ('MOBILITY_AID', 'VISION_AID', 'HEARING_AID', 'COMMUNICATION_AID', 'SCREEN_READER_SOFTWARE', 'OTHER_SOFTWARE', 'OTHER');

-- CreateEnum
CREATE TYPE "BodyPart" AS ENUM ('LEFT_ARM', 'RIGHT_ARM', 'BOTH_ARMS', 'LEFT_LEG', 'RIGHT_LEG', 'BOTH_LEGS', 'HAND', 'SPINE', 'MULTIPLE', 'OTHER');

-- CreateTable
CREATE TABLE "AssistiveTechnology" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssistiveTechnologyType" NOT NULL,

    CONSTRAINT "AssistiveTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateAssistiveTechnology" (
    "candidateProfileId" TEXT NOT NULL,
    "assistiveTechnologyId" TEXT NOT NULL,

    CONSTRAINT "CandidateAssistiveTechnology_pkey" PRIMARY KEY ("candidateProfileId","assistiveTechnologyId")
);

-- CreateTable
CREATE TABLE "CandidateDisabilityDetail" (
    "id" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "category" "DisabilityCategory" NOT NULL,
    "severityPercentage" INTEGER,
    "affectedBodyPart" "BodyPart",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateDisabilityDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAssistiveTechnology" (
    "jobId" TEXT NOT NULL,
    "assistiveTechnologyId" TEXT NOT NULL,

    CONSTRAINT "JobAssistiveTechnology_pkey" PRIMARY KEY ("jobId","assistiveTechnologyId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssistiveTechnology_name_key" ON "AssistiveTechnology"("name");

-- CreateIndex
CREATE INDEX "CandidateAssistiveTechnology_assistiveTechnologyId_idx" ON "CandidateAssistiveTechnology"("assistiveTechnologyId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateDisabilityDetail_candidateProfileId_category_key" ON "CandidateDisabilityDetail"("candidateProfileId", "category");

-- CreateIndex
CREATE INDEX "JobAssistiveTechnology_assistiveTechnologyId_idx" ON "JobAssistiveTechnology"("assistiveTechnologyId");

-- AddForeignKey
ALTER TABLE "CandidateAssistiveTechnology" ADD CONSTRAINT "CandidateAssistiveTechnology_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateAssistiveTechnology" ADD CONSTRAINT "CandidateAssistiveTechnology_assistiveTechnologyId_fkey" FOREIGN KEY ("assistiveTechnologyId") REFERENCES "AssistiveTechnology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateDisabilityDetail" ADD CONSTRAINT "CandidateDisabilityDetail_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAssistiveTechnology" ADD CONSTRAINT "JobAssistiveTechnology_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAssistiveTechnology" ADD CONSTRAINT "JobAssistiveTechnology_assistiveTechnologyId_fkey" FOREIGN KEY ("assistiveTechnologyId") REFERENCES "AssistiveTechnology"("id") ON DELETE CASCADE ON UPDATE CASCADE;
