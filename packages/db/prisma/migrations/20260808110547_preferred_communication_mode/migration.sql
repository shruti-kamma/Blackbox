-- CreateEnum
CREATE TYPE "PreferredCommunicationMode" AS ENUM ('SIGN_LANGUAGE_INTERPRETER', 'SCREEN_READER_COMPATIBLE', 'CAPTIONS_OR_TRANSCRIPT', 'EXTRA_RESPONSE_TIME', 'WRITTEN_ONLY', 'OTHER');

-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "preferredCommunicationModes" "PreferredCommunicationMode"[];

