-- CreateEnum
CREATE TYPE "AssessmentSection" AS ENUM ('LISTENING', 'SPEAKING', 'READING', 'WRITING', 'APTITUDE', 'SKILL_BASED');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_candidateProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_jobId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewQuestion" DROP CONSTRAINT "InterviewQuestion_interviewId_fkey";

-- DropIndex
DROP INDEX "Application_interviewId_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "interviewId";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "requiresAiInterview";

-- DropTable
DROP TABLE "Interview";

-- DropTable
DROP TABLE "InterviewQuestion";

-- DropEnum
DROP TYPE "InterviewMode";

-- DropEnum
DROP TYPE "InterviewStatus";

-- CreateTable
CREATE TABLE "AssessmentQuestion" (
    "id" TEXT NOT NULL,
    "section" "AssessmentSection" NOT NULL,
    "prompt" TEXT NOT NULL,
    "passage" TEXT,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateAssessment" (
    "id" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER,
    "languageScore" INTEGER,
    "aptitudeScore" INTEGER,
    "skillScore" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CandidateAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateAssessmentAnswer" (
    "id" TEXT NOT NULL,
    "candidateAssessmentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "section" "AssessmentSection" NOT NULL,
    "prompt" TEXT NOT NULL,
    "passage" TEXT,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "selectedIndex" INTEGER,
    "skillName" TEXT,

    CONSTRAINT "CandidateAssessmentAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentQuestion_section_idx" ON "AssessmentQuestion"("section");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateAssessment_candidateProfileId_key" ON "CandidateAssessment"("candidateProfileId");

-- CreateIndex
CREATE INDEX "CandidateAssessmentAnswer_candidateAssessmentId_idx" ON "CandidateAssessmentAnswer"("candidateAssessmentId");

-- AddForeignKey
ALTER TABLE "CandidateAssessment" ADD CONSTRAINT "CandidateAssessment_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateAssessmentAnswer" ADD CONSTRAINT "CandidateAssessmentAnswer_candidateAssessmentId_fkey" FOREIGN KEY ("candidateAssessmentId") REFERENCES "CandidateAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

