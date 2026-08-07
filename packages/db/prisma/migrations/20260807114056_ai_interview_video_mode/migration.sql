-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('TEXT', 'VIDEO');

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "mode" "InterviewMode" NOT NULL DEFAULT 'TEXT';

-- AlterTable
ALTER TABLE "InterviewQuestion" ADD COLUMN     "videoUrl" TEXT;

