-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "phoneNormalized" TEXT,
ADD COLUMN     "phoneVerifiedNormalized" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedNormalized" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_phoneVerifiedNormalized_key" ON "CandidateProfile"("phoneVerifiedNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerifiedNormalized_key" ON "User"("emailVerifiedNormalized");
