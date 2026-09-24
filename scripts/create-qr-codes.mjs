/**
 * Starter QR codes for the records that actually exist in the field.
 *
 * Codes are short and typable because the printed sticker carries the code in text under
 * the square — a phone camera that will not focus in the sun is a normal afternoon at the
 * temple, and someone should be able to type the thing instead.
 *
 * Demo records deliberately get no codes. A sticker is a physical object that outlives the
 * database row it points at, so only real content is worth printing.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const boat2568 = await prisma.boat.findUnique({ where: { slug: "rua-phra-wat-rattanaram-2568" }, select: { id: true } });
const boat2567 = await prisma.boat.findUnique({ where: { slug: "rua-phra-wat-rattanaram-2567" }, select: { id: true } });
const pattern = await prisma.pattern.findUnique({ where: { slug: "lai-dok-bon-thaeb-kradat" }, select: { id: true } });
const master = await prisma.master.findUnique({ where: { slug: "chang-lai-kradat-rattanaram" }, select: { id: true } });

const plan = [
  { code: "boat-2568", label: "เรือพระวัดรัตนาราม พ.ศ. 2568", targetKind: "BOAT", boatId: boat2568?.id },
  { code: "boat-2567", label: "เรือพระวัดรัตนาราม พ.ศ. 2567", targetKind: "BOAT", boatId: boat2567?.id },
  { code: "lai-kradat", label: "ลายดอกบนแถบกระดาษ", targetKind: "PATTERN", patternId: pattern?.id },
  { code: "chang-kradat", label: "ช่างลายกระดาษ วัดรัตนาราม", targetKind: "MASTER", masterId: master?.id },
  { code: "craft", label: "จากกระดาษสู่เรือพระ — กระบวนการทั้งหมด", targetKind: "PROCESS", processId: (await prisma.knowledgeProcess.findFirst({ select: { id: true } }))?.id },
];

for (const entry of plan) {
  const target = entry.boatId ?? entry.patternId ?? entry.masterId ?? entry.processId;
  if (!target) {
    console.warn(`ข้าม ${entry.code} — ยังไม่มีเนื้อหาปลายทางในฐานข้อมูล`);
    continue;
  }
  const row = await prisma.qRCode.upsert({
    where: { code: entry.code },
    update: { label: entry.label, targetKind: entry.targetKind, boatId: entry.boatId ?? null, patternId: entry.patternId ?? null, masterId: entry.masterId ?? null, processId: entry.processId ?? null },
    create: { ...entry, active: true, isDemo: false },
    select: { code: true, label: true, scanCount: true },
  });
  console.log(`/q/${row.code}  →  ${row.label}  (สแกนแล้ว ${row.scanCount} ครั้ง)`);
}

await prisma.$disconnect();
