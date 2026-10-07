-- CreateEnum
CREATE TYPE "CompetitionYearStatus" AS ENUM ('JUDGED', 'NOT_HELD');

-- CreateTable
CREATE TABLE "CompetitionYear" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "year" INTEGER NOT NULL,
    "status" "CompetitionYearStatus" NOT NULL,
    "note" TEXT,
    "sourceId" UUID,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitionYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionResult" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "yearId" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "templeId" UUID NOT NULL,
    "note" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitionResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionYear_year_key" ON "CompetitionYear"("year");

-- CreateIndex
CREATE INDEX "CompetitionYear_sourceId_idx" ON "CompetitionYear"("sourceId");

-- CreateIndex
CREATE INDEX "CompetitionResult_templeId_idx" ON "CompetitionResult"("templeId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionResult_yearId_rank_key" ON "CompetitionResult"("yearId", "rank");

-- AddForeignKey
ALTER TABLE "CompetitionYear" ADD CONSTRAINT "CompetitionYear_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionResult" ADD CONSTRAINT "CompetitionResult_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "CompetitionYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionResult" ADD CONSTRAINT "CompetitionResult_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- A placing is 1st or better-numbered; a rank of 0 or -1 is a mistake, not a result.
ALTER TABLE "CompetitionResult" ADD CONSTRAINT "competition_rank_positive" CHECK ("rank" >= 1);

-- Buddhist calendar, like Boat.year. A Gregorian year typed in by mistake is caught here
-- rather than becoming a row the public page renders as พ.ศ. 2025.
ALTER TABLE "CompetitionYear" ADD CONSTRAINT "competition_year_buddhist" CHECK ("year" BETWEEN 2400 AND 2700);
