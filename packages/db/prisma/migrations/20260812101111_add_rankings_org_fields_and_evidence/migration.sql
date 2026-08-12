-- AlterTable: add slug as nullable first — 12 real Organization rows
-- already exist, so a required column needs a backfill before it can be
-- made NOT NULL + UNIQUE (Prisma's naive diff can't express this; see the
-- "Important fix applied mid-build" pattern used for prior backfills in
-- this project, e.g. the KYC verified-flag migration).
ALTER TABLE "Organization" ADD COLUMN     "slug" TEXT;
ALTER TABLE "Organization" ADD COLUMN     "logoUrl" TEXT;
ALTER TABLE "Organization" ADD COLUMN     "industry" TEXT;
ALTER TABLE "Organization" ADD COLUMN     "location" TEXT;

-- Backfill: slugify each existing org's name (lowercase, non-alphanumeric
-- runs collapsed to a single hyphen, trimmed), then de-duplicate by
-- appending -2, -3, ... to any collision — with real company names this is
-- extremely unlikely to trigger, but two Organizations could plausibly
-- share a near-identical name.
WITH base AS (
  SELECT
    id,
    trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')) AS base_slug
  FROM "Organization"
),
numbered AS (
  SELECT
    id,
    base_slug,
    row_number() OVER (PARTITION BY base_slug ORDER BY id) AS rn
  FROM base
)
UPDATE "Organization" o
SET "slug" = CASE WHEN n.rn = 1 THEN n.base_slug ELSE n.base_slug || '-' || n.rn END
FROM numbered n
WHERE o.id = n.id;

-- Now safe to enforce NOT NULL + UNIQUE, same as the column would have
-- been defined from the start on a fresh table.
ALTER TABLE "Organization" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fyFrom" INTEGER NOT NULL,
    "fyTo" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceDocument" TEXT NOT NULL,
    "originalPage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evidence_organizationId_fyFrom_fyTo_idx" ON "Evidence"("organizationId", "fyFrom", "fyTo");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_metric_idx" ON "Evidence"("organizationId", "metric");

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
