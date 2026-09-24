/**
 * The artisan photographed at work.
 *
 * The archive has his photograph and his consent to publish it, but not yet his name or
 * anything he said. So the record holds what is actually known and says the rest is
 * pending — rather than either inventing a name or leaving a real, consented photograph
 * unused while a fictional artisan stands in for him.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const master = await prisma.master.upsert({
  where: { slug: "chang-lai-kradat-rattanaram" },
  update: {},
  create: {
    slug: "chang-lai-kradat-rattanaram",
    name: "ช่างลายกระดาษ วัดรัตนาราม",
    biography:
      "ช่างผู้ตอกลายกระดาษสำหรับเรือพระวัดรัตนาราม อำเภอปากพะยูน บันทึกภาพขณะทำงานที่ศูนย์การเรียนรู้เรือพระ " +
      "ชื่อ ประวัติ และคำบอกเล่าของช่างยังรอการสัมภาษณ์และบันทึกอย่างเป็นทางการ",
    // No quote is recorded, because nothing he said has been written down yet.
    quote: null,
    practiceSinceYear: null,
    isDemo: false,
  },
});

for (const title of ["การตอกลายกระดาษ", "การออกแบบลวดลายสำหรับเรือพระ"]) {
  await prisma.masterExpertise.upsert({
    where: { masterId_title: { masterId: master.id, title } },
    update: {},
    create: { masterId: master.id, title },
  });
}

const boats = await prisma.boat.findMany({ where: { isDemo: false }, select: { id: true } });
for (const boat of boats) {
  await prisma.masterBoat.upsert({
    where: { masterId_boatId: { masterId: master.id, boatId: boat.id } },
    update: {},
    create: { masterId: master.id, boatId: boat.id, contribution: "งานลายกระดาษ — รอการยืนยันขอบเขตงานจากช่าง" },
  });
}

const existing = await prisma.contentVerification.findUnique({ where: { masterId: master.id } });
if (!existing) {
  await prisma.contentVerification.create({
    data: { masterId: master.id, status: "PENDING_REVIEW", note: "รอการสัมภาษณ์เพื่อบันทึกชื่อและประวัติของช่าง" },
  });
}

console.log(`Field master ready: ${master.name} (linked to ${boats.length} boats)`);
await prisma.$disconnect();
