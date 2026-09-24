/**
 * Marks every field record as awaiting review.
 *
 * A record created from photographs is real but not yet confirmed: the artisans and the
 * community have not read it back. Recording that as an explicit status is what lets the
 * pages say so, instead of leaving the absence of a badge to imply approval.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const note = "สร้างจากภาพบันทึกภาคสนาม รอให้ช่างและชุมชนอ่านทวนก่อนเผยแพร่เป็นข้อมูลที่ยืนยันแล้ว";

const targets = [
  ["boatId", await prisma.boat.findMany({ where: { isDemo: false }, select: { id: true } })],
  ["patternId", await prisma.pattern.findMany({ where: { isDemo: false }, select: { id: true } })],
  ["processId", await prisma.knowledgeProcess.findMany({ where: { isDemo: false }, select: { id: true } })],
  ["stepId", await prisma.processStep.findMany({ where: { isDemo: false }, select: { id: true } })],
  ["sectionId", await prisma.boatSection.findMany({ where: { isDemo: false }, select: { id: true } })],
];

let count = 0;
for (const [field, records] of targets) {
  for (const { id } of records) {
    const existing = await prisma.contentVerification.findUnique({ where: { [field]: id } });
    if (existing) {
      if (existing.status === "DRAFT") {
        await prisma.contentVerification.update({ where: { id: existing.id }, data: { status: "PENDING_REVIEW", note } });
        count += 1;
      }
      continue;
    }
    await prisma.contentVerification.create({ data: { [field]: id, status: "PENDING_REVIEW", note } });
    count += 1;
  }
}
console.log(`Marked ${count} field records as PENDING_REVIEW.`);
await prisma.$disconnect();
