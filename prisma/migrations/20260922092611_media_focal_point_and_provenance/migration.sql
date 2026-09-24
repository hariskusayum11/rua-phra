-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "focalX" DOUBLE PRECISION,
ADD COLUMN     "focalY" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "photographer" TEXT,
ADD COLUMN     "takenAt" DATE;
