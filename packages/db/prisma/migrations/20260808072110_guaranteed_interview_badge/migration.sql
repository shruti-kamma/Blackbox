-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "metEssentialCriteria" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "offersGuaranteedInterview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "JobSkill" ADD COLUMN     "essential" BOOLEAN NOT NULL DEFAULT true;

