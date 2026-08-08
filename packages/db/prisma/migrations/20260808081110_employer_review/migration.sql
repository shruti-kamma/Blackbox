-- CreateTable
CREATE TABLE "EmployerReview" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "honoredAccommodations" BOOLEAN,
    "accessibleProcess" BOOLEAN NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployerReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployerReview_organizationId_idx" ON "EmployerReview"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerReview_organizationId_candidateProfileId_key" ON "EmployerReview"("organizationId", "candidateProfileId");

-- AddForeignKey
ALTER TABLE "EmployerReview" ADD CONSTRAINT "EmployerReview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerReview" ADD CONSTRAINT "EmployerReview_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

