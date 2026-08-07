-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "accommodationRequestSentAt" TIMESTAMP(3),
ADD COLUMN     "accommodationRequestText" TEXT,
ADD COLUMN     "accommodationsApprovedAt" TIMESTAMP(3),
ADD COLUMN     "accommodationsApprovedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_accommodationsApprovedByUserId_fkey" FOREIGN KEY ("accommodationsApprovedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
