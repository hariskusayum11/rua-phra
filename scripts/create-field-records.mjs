/**
 * Creates the records that real field material attaches to.
 *
 * Everything written here is evidenced by the photographs themselves or by the labels the
 * field team put on the files. Where the archive does not yet know something — a boat's
 * design concept, the local name of a pattern — the field says so in plain Thai rather
 * than guessing, and the record carries a DRAFT verification status until an artisan or
 * the community confirms it.
 *
 * Demo records are left untouched. They stay as fixtures for the test suite, and the site
 * ranks verified field content above them.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PatternCategory } from "../src/generated/prisma/enums.ts";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PENDING = "ข้อมูลนี้บันทึกจากภาคสนามแล้ว แต่ยังรอการตรวจสอบร่วมกับช่างและชุมชน";

const temple = await prisma.temple.upsert({
  where: { slug: "wat-rattanaram-pak-phayun" },
  update: {},
  create: {
    slug: "wat-rattanaram-pak-phayun",
    name: "วัดรัตนาราม",
    community: "อำเภอปากพะยูน จังหวัดพัทลุง",
    description: "วัดที่มีศูนย์การเรียนรู้เรือพระ ร่วมกับมหาวิทยาลัยทักษิณ",
    isDemo: false,
  },
});

const boat = await prisma.boat.upsert({
  where: { slug: "rua-phra-wat-rattanaram-2567" },
  update: {},
  create: {
    slug: "rua-phra-wat-rattanaram-2567",
    name: "เรือพระวัดรัตนาราม",
    year: 2567,
    concept: "ยังไม่ได้บันทึกแนวคิดของเรือลำนี้ รอการสัมภาษณ์ช่างผู้ออกแบบ",
    summary:
      "เรือพระของวัดรัตนาราม อำเภอปากพะยูน ที่บันทึกภาพไว้ในปี พ.ศ. 2567 " +
      "ภาพชุดนี้บันทึกจากพื้นที่จริง ส่วนคำอธิบายรายละเอียดยังรอการตรวจสอบร่วมกับช่างและชุมชน",
    templeId: temple.id,
    isDemo: false,
  },
});

/**
 * Section names come from the interpretive board photographed at the shed
 * ("องค์ประกอบเรือพระวัดรัตนาราม"), so the vocabulary is the community's own rather than
 * anything invented here.
 *
 * Only the parts visible in this boat's cover photograph get a hotspot. The board lists
 * more — บุษบก, ยอด, หางพญานาค, เรือนแก้ว — and they will be added when a full side-on
 * photograph of this boat has been cleared for use. A hotspot pointing at empty sky
 * teaches nothing.
 */
const sections = [
  { slug: "hua-phaya-nak", name: "หัวพญานาค", x: 52, y: 74, description: "หัวพญานาคที่ยื่นออกจากหัวเรือ ลงสีตัดกันเป็นชั้นและเป็นจุดนำสายตาแรกของทั้งลำ" },
  { slug: "sian-nak-son-chan", name: "เศียรนาคซ้อนชั้น", x: 63, y: 49, description: "เศียรนาคที่เรียงซ้อนกันลึกเข้าไปในโรงเรือน ทำให้เห็นจังหวะของลำตัวพญานาคทั้งแถว" },
  { slug: "lam-tua-phaya-nak", name: "ลำตัวพญานาค", x: 74, y: 60, description: "ลำตัวพญานาคที่ประดับด้วยเกล็ดเรียงต่อเนื่อง ทอดยาวไปตามแนวข้างของเรือ" },
  { slug: "tua-ruea", name: "ตัวเรือ (แม่ลำ)", x: 80, y: 85, description: "ลำตัวเรือที่รองรับองค์ประกอบทั้งหมด และเป็นพื้นที่ของแถบลวดลายยาวตลอดลำ" },
];

// Positions are unique per boat, so move the existing rows aside before renumbering.
await prisma.boatSection.updateMany({ where: { boatId: boat.id }, data: { position: { increment: 100 } } });

for (const [index, section] of sections.entries()) {
  await prisma.boatSection.upsert({
    where: { boatId_slug: { boatId: boat.id, slug: section.slug } },
    update: { name: section.name, x: section.x, y: section.y, position: index + 1 },
    create: {
      boatId: boat.id,
      slug: section.slug,
      name: section.name,
      x: section.x,
      y: section.y,
      position: index + 1,
      description: section.description,
      meaning: null,
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
      "ชุดภาพของเรือลำนี้บันทึกที่วัดรัตนาราม อำเภอปากพะยูน ซึ่งมีศูนย์การเรียนรู้เรือพระร่วมกับมหาวิทยาลัยทักษิณ " +
      "เรื่องเล่าและแนวคิดเบื้องหลังการออกแบบยังรอการสัมภาษณ์ช่างผู้สร้าง",
    kind: "MAIN",
    position: 1,
    isDemo: false,
  },
});

/**
 * Patterns recorded from the photographs. Where the community's own name for a pattern is
 * not yet known, the record carries a plain descriptive name and says so — a working label
 * the field team can correct, not a claim about what the pattern is called.
 */
const patterns = [
  {
    slug: "kled-phaya-nak-rattanaram",
    name: "ลายเกล็ดพญานาค",
    localName: null,
    category: PatternCategory.MYTHICAL,
    characteristics:
      "เกล็ดรูปโค้งซ้อนเหลื่อมกันเป็นชั้น ขอบเกล็ดหุ้มด้วยแผ่นโลหะบาง ภายในเป็นใบไม้สานสลับกับฟอยล์สีบานเย็นและสีทอง",
    meaning: "ทีมภาคสนามบันทึกว่าเรือลำนี้ใช้เกล็ดราว 6,000 เกล็ด — จำนวนนี้รอการยืนยันจากช่าง",
  },
  {
    slug: "lai-chalu-kradat-rattanaram",
    name: "ลายฉลุกระดาษ",
    localName: null,
    category: PatternCategory.FOLIAGE,
    characteristics:
      "ลายกระหนกที่เกิดจากการตอกเจาะกระดาษให้เป็นช่องโปร่ง เส้นลายต่อเนื่องกันทั้งแผ่นโดยไม่ขาดตอน",
    meaning: null,
  },
  {
    slug: "lai-thaeb-si-lam-ruea",
    name: "ลายแถบสีบนลำเรือ",
    localName: null,
    category: PatternCategory.FLORAL,
    characteristics:
      "แถบลายดอกสี่กลีบและลายใบวางสลับกันเป็นชั้นตลอดลำเรือ ใช้สีแดง เหลือง ส้ม ชมพู และเขียวตัดกันอย่างชัดเจน",
    meaning: null,
  },
  {
    slug: "lai-dok-bon-thaeb-kradat",
    name: "ลายดอกบนแถบกระดาษ",
    localName: null,
    category: PatternCategory.FLORAL,
    characteristics:
      "ดอกกลมกลางแถบ ล้อมด้วยกลีบและเปลวไล่สี ทำเป็นแถบยาวสำหรับติดตามแนวขององค์ประกอบเรือ",
    meaning: null,
  },
];

for (const pattern of patterns) {
  await prisma.pattern.upsert({
    where: { slug: pattern.slug },
    update: {},
    create: { ...pattern, isDemo: false },
  });
  const record = await prisma.pattern.findUnique({ where: { slug: pattern.slug }, select: { id: true } });
  await prisma.boatPattern.upsert({
    where: { boatId_patternId: { boatId: boat.id, patternId: record.id } },
    update: {},
    create: { boatId: boat.id, patternId: record.id },
  });
}

console.log(`Field records ready: ${temple.name} · ${boat.name} พ.ศ. ${boat.year} · ${sections.length} sections · ${patterns.length} patterns`);
console.log(PENDING);
await prisma.$disconnect();
