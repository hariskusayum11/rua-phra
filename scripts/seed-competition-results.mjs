/**
 * Thirteen years of placings in the Pak Phayun procession competition, 2556–2568.
 *
 * The run is idempotent: every row is keyed on something unique (a temple's slug, a year,
 * a year-and-rank pair) and upserted, so running it twice changes nothing.
 *
 * Two things in the source material did not agree with themselves, and both are kept
 * rather than tidied away: วัดสุภาษิตาราม was written with a doubled ต in one year, and
 * วัดรัตนาราม's village was written บ่อหมาแป๊ะ in every year but 2568, where it reads
 * หมอหมาแปะ. The canonical spellings were confirmed by the project team; the variant each
 * row was recorded with sits in that row's note, because an archive that silently
 * normalises its sources stops being able to show what it actually received.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const PAK_PHAYUN = "อำเภอปากพะยูน จังหวัดพัทลุง";

/**
 * วัดรัตนาราม is already in the archive with field material behind it, so it is matched by
 * slug and left exactly as it is. The other six exist here only as names on a results
 * list — no description is written for them, because nobody has visited them yet.
 */
const temples = [
  { key: "khuan-piyaram", slug: "wat-khuan-piyaram", name: "วัดควนปิยาราม", community: `บ้านโพธิ์ ${PAK_PHAYUN}` },
  { key: "rattanaram", slug: "wat-rattanaram-pak-phayun", name: "วัดรัตนาราม", community: PAK_PHAYUN },
  { key: "laem-dinso", slug: "wat-laem-dinso", name: "วัดแหลมดินสอ", community: PAK_PHAYUN },
  { key: "hua-khuan", slug: "wat-hua-khuan", name: "วัดหัวควน", community: PAK_PHAYUN },
  { key: "suphasitaram", slug: "wat-suphasitaram", name: "วัดสุภาษิตาราม", community: `เกาะแกง ${PAK_PHAYUN}` },
  { key: "ko-yuan", slug: "wat-ko-yuan", name: "วัดเกาะยวน", community: PAK_PHAYUN },
  { key: "don-pradu", slug: "wat-don-pradu", name: "วัดดอนประดู่", community: PAK_PHAYUN },
];

const SPELT_SUPHASITTARAM = 'บันทึกต้นทางสะกดว่า "วัดสุภาษิตตาราม"';
const SPELT_MOR_MA_PAE = 'บันทึกต้นทางเขียนว่า "วัดรัตนาราม (หมอหมาแปะ)"';

const years = [
  { year: 2556, note: "ปีแรกที่มีการชิงถ้วยพระราชทาน", places: ["khuan-piyaram", "rattanaram", "laem-dinso"] },
  { year: 2557, places: ["rattanaram", "khuan-piyaram", "hua-khuan"] },
  { year: 2558, places: ["hua-khuan", "khuan-piyaram", "rattanaram"] },
  { year: 2559, held: false, note: "งดจัดงาน" },
  { year: 2560, held: false, note: "ไม่มีการแข่งขัน" },
  { year: 2561, places: ["suphasitaram", "hua-khuan", "khuan-piyaram"], notes: { 1: SPELT_SUPHASITTARAM } },
  { year: 2562, places: ["ko-yuan", "khuan-piyaram", "rattanaram"] },
  { year: 2563, places: ["ko-yuan", "suphasitaram", "rattanaram"] },
  { year: 2564, held: false, note: "ไม่มีการจัดงาน" },
  { year: 2565, places: ["rattanaram", "ko-yuan", "khuan-piyaram"] },
  { year: 2566, places: ["rattanaram", "khuan-piyaram", "hua-khuan"] },
  { year: 2567, note: "ปีนี้ประกาศผลถึงอันดับที่ 4", places: ["rattanaram", "don-pradu", "suphasitaram", "hua-khuan"] },
  { year: 2568, places: ["don-pradu", "rattanaram", "hua-khuan"], notes: { 2: SPELT_MOR_MA_PAE } },
];

// KnowledgeSource has no natural key, so the title stands in for one on a re-run.
const SOURCE_TITLE = "ผลการประกวดเรือพระ งานลากพระอำเภอปากพะยูน พ.ศ. 2556–2568";
const source =
  (await prisma.knowledgeSource.findFirst({ where: { title: SOURCE_TITLE } })) ??
  (await prisma.knowledgeSource.create({
    data: {
      title: SOURCE_TITLE,
      kind: "PUBLICATION",
      citation: "เพจ/สื่อออนไลน์ของงานลากพระปากพะยูน",
      fieldNote:
        "ยังไม่ได้บันทึกลิงก์ของประกาศและวันที่เข้าถึง จึงยังอ้างอิงกลับไปตรวจสอบไม่ได้ " +
        "ต้องเติมก่อนเลื่อนสถานะเป็นตรวจสอบแล้ว",
    },
  }));

// Pending review, not verified: the placings came from an online announcement nobody has
// checked against the organiser's own record yet.
await prisma.contentVerification.upsert({
  where: { sourceId: source.id },
  update: {},
  create: { sourceId: source.id, status: "PENDING_REVIEW" },
});

const byKey = new Map();
for (const temple of temples) {
  const row = await prisma.temple.upsert({
    where: { slug: temple.slug },
    update: {},
    create: { slug: temple.slug, name: temple.name, community: temple.community },
  });
  byKey.set(temple.key, row);
}

for (const entry of years) {
  const held = entry.held !== false;
  const row = await prisma.competitionYear.upsert({
    where: { year: entry.year },
    update: { status: held ? "JUDGED" : "NOT_HELD", note: entry.note ?? null, sourceId: source.id },
    create: { year: entry.year, status: held ? "JUDGED" : "NOT_HELD", note: entry.note ?? null, sourceId: source.id },
  });

  const places = entry.places ?? [];
  for (const [index, key] of places.entries()) {
    const rank = index + 1;
    const temple = byKey.get(key);
    if (!temple) throw new Error(`unknown temple key ${key} in ${entry.year}`);
    const note = entry.notes?.[rank] ?? null;
    await prisma.competitionResult.upsert({
      where: { yearId_rank: { yearId: row.id, rank } },
      update: { templeId: temple.id, note },
      create: { yearId: row.id, rank, templeId: temple.id, note },
    });
  }
  // A year edited down to fewer places should not keep the ones it lost.
  await prisma.competitionResult.deleteMany({ where: { yearId: row.id, rank: { gt: places.length } } });
}

const judged = await prisma.competitionYear.count({ where: { status: "JUDGED" } });
const notHeld = await prisma.competitionYear.count({ where: { status: "NOT_HELD" } });
const results = await prisma.competitionResult.count();
console.log({ temples: byKey.size, judged, notHeld, results });

await prisma.$disconnect();
