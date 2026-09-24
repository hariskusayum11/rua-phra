-- AlterTable
ALTER TABLE "Boat" ADD COLUMN     "processionMediaId" UUID;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "posterMediaId" UUID;

-- CreateIndex
CREATE INDEX "Boat_processionMediaId_idx" ON "Boat"("processionMediaId");

-- CreateIndex
CREATE INDEX "Media_posterMediaId_idx" ON "Media"("posterMediaId");

-- AddForeignKey
ALTER TABLE "Boat" ADD CONSTRAINT "Boat_processionMediaId_fkey" FOREIGN KEY ("processionMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_posterMediaId_fkey" FOREIGN KEY ("posterMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
