/**
 * The 2568 boat, recorded from the side-on photograph.
 *
 * A full side profile is what the interactive reader has been waiting for: every part named
 * on the learning-centre board is visible in one frame, so each hotspot can sit on the thing
 * it names instead of near it.
 *
 * Part names come from the board photographed at the shed
 * ("องค์ประกอบเรือพระวัดรัตนาราม"). Head and tail were confirmed by enlarging both ends of
 * the photograph rather than assumed from the board's drawing, which faces the other way.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const temple = await prisma.temple.findUniqueOrThrow({ where: { slug: "wat-rattanaram-pak-phayun" } });

const boat = await prisma.boat.upsert({
  where: { slug: "rua-phra-wat-rattanaram-2568" },
  update: {},
  create: {
    slug: "rua-phra-wat-rattanaram-2568",
    name: "เรือพระวัดรัตนาราม",
    year: 2568,
    concept: "ยังไม่ได้บันทึกแนวคิดของเรือลำนี้ รอการสัมภาษณ์ช่างผู้ออกแบบ",
    summary:
      "เรือพระของวัดรัตนาราม อำเภอปากพะยูน ปี พ.ศ. 2568 บันทึกภาพด้านข้างเต็มลำ " +
      "ทำให้เห็นองค์ประกอบครบตั้งแต่หัวพญานาคจนถึงหางพญานาค คำอธิบายรายละเอียดรอการตรวจสอบร่วมกับช่างและชุมชน",
    templeId: temple.id,
    isDemo: false,
  },
});

/** Percentages measured against the cover photograph, which is already 16:9 and so is not cropped. */
const sections = [
  {
    slug: "hua-phaya-nak",
    name: "หัวพญานาค",
    x: 25.5,
    y: 51,
    mediaKey: "field-section-2568-hua-phaya-nak",
    description: "หัวพญานาคหลายเศียรเรียงซ้อนกันที่หัวเรือ แต่ละเศียรมีหงอน เกล็ด และเปลวไฟล้อมรอบ",
    meaning: null,
  },
  {
    slug: "yot",
    name: "ยอด",
    x: 48.5,
    y: 42,
    mediaKey: "field-section-2568-yot",
    description: "ยอดเรือนที่ไล่ขนาดขึ้นไปเป็นชั้น เป็นจุดสูงสุดและสร้างจังหวะแนวตั้งให้ทั้งลำ",
    meaning: null,
  },
  {
    slug: "busabok",
    name: "บุษบก",
    x: 48.5,
    y: 56,
    mediaKey: "field-section-2568-busabok",
    description: "เรือนยอดกลางลำสำหรับประดิษฐานพระพุทธรูป เป็นศูนย์กลางขององค์ประกอบทั้งหมด",
    meaning: null,
  },
  {
    slug: "ruean-kaeo",
    name: "เรือนแก้ว",
    x: 59,
    y: 53,
    mediaKey: "field-section-2568-ruean-kaeo",
    description: "กรอบซุ้มที่ล้อมองค์พระ ตกแต่งด้วยลายกระหนกและพื้นสีแดงตัดกับลายทอง",
    meaning: null,
  },
  {
    slug: "hang-phaya-nak",
    name: "หางพญานาค",
    x: 80,
    y: 56,
    mediaKey: "field-section-2568-hang-phaya-nak",
    description: "หางพญานาคที่สะบัดขึ้นเป็นพุ่ม ปลายหางม้วนเป็นเปลว ปิดจังหวะของลำเรือให้สมดุลกับหัวเรือ",
    meaning: null,
  },
  {
    slug: "tua-ruea",
    name: "ตัวเรือ (แม่ลำ)",
    x: 37,
    y: 84,
    mediaKey: "field-section-2568-tua-ruea",
    description: "ลำตัวเรือที่รองรับองค์ประกอบทั้งหมด ประดับด้วยแถบลวดลายต่อเนื่องและป้ายชื่อวัดอยู่กลางลำ",
    meaning: null,
  },
];

// Positions are unique per boat, so move any existing rows aside before renumbering.
await prisma.boatSection.updateMany({ where: { boatId: boat.id }, data: { position: { increment: 100 } } });

for (const [index, section] of sections.entries()) {
  await prisma.boatSection.upsert({
    where: { boatId_slug: { boatId: boat.id, slug: section.slug } },
    update: { name: section.name, x: section.x, y: section.y, position: index + 1, description: section.description },
    create: {
      boatId: boat.id,
      slug: section.slug,
      name: section.name,
      x: section.x,
      y: section.y,
      position: index + 1,
      description: section.description,
      meaning: section.meaning,
      isDemo: false,
    },
  });
}

await prisma.boatStory.upsert({
  where: { boatId_position: { boatId: boat.id, position: 1 } },
  update: {},
  create: {
    boatId: boat.id,
    title: "บันทึกภาคสนาม",
    body:
      "ภาพด้านข้างเต็มลำของเรือลำนี้ทำให้เห็นองค์ประกอบครบในเฟรมเดียว " +
      "ชื่อเรียกแต่ละส่วนอ้างอิงจากป้ายองค์ประกอบเรือพระที่ศูนย์การเรียนรู้วัดรัตนาราม " +
      "ส่วนเรื่องเล่าและแนวคิดการออกแบบรอการสัมภาษณ์ช่างผู้สร้าง",
    kind: "MAIN",
    position: 1,
    isDemo: false,
  },
});

// Every pattern already recorded belongs to this boat too.
const patterns = await prisma.pattern.findMany({ where: { isDemo: false }, select: { id: true } });
for (const pattern of patterns) {
  await prisma.boatPattern.upsert({
    where: { boatId_patternId: { boatId: boat.id, patternId: pattern.id } },
    update: {},
    create: { boatId: boat.id, patternId: pattern.id },
  });
}

console.log(`${boat.name} พ.ศ. ${boat.year} · ${sections.length} sections · linked ${patterns.length} patterns`);
console.log("Section close-ups expect these media keys:", sections.map((s) => s.mediaKey).join(", "));
await prisma.$disconnect();
