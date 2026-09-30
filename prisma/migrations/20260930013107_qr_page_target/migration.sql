-- AlterEnum
ALTER TYPE "QRTargetKind" ADD VALUE 'PAGE';

-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN     "path" VARCHAR(200);
