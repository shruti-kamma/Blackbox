-- CreateEnum
CREATE TYPE "AssessmentDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- DropIndex
DROP INDEX "AssessmentQuestion_section_idx";

-- AlterTable
ALTER TABLE "AssessmentQuestion" ADD COLUMN     "difficulty" "AssessmentDifficulty" NOT NULL DEFAULT 'EASY';

-- AlterTable
ALTER TABLE "CandidateAssessment" ADD COLUMN     "currentLevel" "AssessmentDifficulty" NOT NULL DEFAULT 'EASY',
ADD COLUMN     "currentRound" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "easyScore" INTEGER,
ADD COLUMN     "hardScore" INTEGER,
ADD COLUMN     "highestLevelReached" "AssessmentDifficulty",
ADD COLUMN     "mediumScore" INTEGER;

-- AlterTable
ALTER TABLE "CandidateAssessmentAnswer" ADD COLUMN     "difficulty" "AssessmentDifficulty" NOT NULL DEFAULT 'EASY',
ADD COLUMN     "round" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "AssessmentQuestion_section_difficulty_idx" ON "AssessmentQuestion"("section", "difficulty");

-- CreateIndex
CREATE INDEX "CandidateAssessmentAnswer_candidateAssessmentId_round_idx" ON "CandidateAssessmentAnswer"("candidateAssessmentId", "round");
