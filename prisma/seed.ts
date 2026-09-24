import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  BoatStoryKind,
  MediaKind,
  MediaProvider,
  PatternCategory,
  PrismaClient,
  Role,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * Every demo record is flagged isDemo and named so it reads as fictional. Nothing here is a
 * cultural claim; the field team replaces each row once interviews are verified.
 *
 * Placeholder artwork is stored at the aspect ratio the production photograph will use, so a
 * real image can be swapped in without touching any layout.
 */
const RATIO = {
  wide: { width: 1920, height: 1080 }, // 16:9 — boats, closing
  detail: { width: 1600, height: 900 }, // 16:9 — section close-ups
  macro: { width: 1200, height: 1500 }, // 4:5 — craft macro, portraits
  swatch: { width: 1200, height: 1200 }, // 1:1 — patterns
  step: { width: 1500, height: 1000 }, // 3:2 — process steps
} as const;

type MediaSpec = {
  key: string;
  file: string;
  alt: string;
  ratio: keyof typeof RATIO;
  credit?: string;
};

const DEMO_CREDIT = "ภาพตัวอย่างสำหรับการพัฒนา ไม่ใช่ภาพถ่ายหรือหลักฐานทางวัฒนธรรม";

const mediaSpecs: MediaSpec[] = [
  { key: "boat-demo-cover", file: "boat-16x9-1.svg", alt: "ภาพตัวอย่างเรือพระวัดดอนประดู่ทั้งลำ (ข้อมูลสาธิต)", ratio: "wide" },
  { key: "boat-demo-cover-2", file: "boat-16x9-2.svg", alt: "ภาพตัวอย่างเรือพระวัดคลองเทียนทั้งลำ (ข้อมูลสาธิต)", ratio: "wide" },
  { key: "boat-demo-cover-3", file: "boat-16x9-3.svg", alt: "ภาพตัวอย่างเรือพระวัดปากพะยูนทั้งลำ (ข้อมูลสาธิต)", ratio: "wide" },
  { key: "closing-demo", file: "closing-16x9.svg", alt: "ภาพตัวอย่างเรือพระในช่วงเย็น (ข้อมูลสาธิต)", ratio: "wide" },
  { key: "section-demo-chofa", file: "detail-16x9-1.svg", alt: "ภาพตัวอย่างส่วนยอดเรือพระ (ข้อมูลสาธิต)", ratio: "detail" },
  { key: "section-demo-mandapa", file: "detail-16x9-2.svg", alt: "ภาพตัวอย่างบุษบกกลางเรือพระ (ข้อมูลสาธิต)", ratio: "detail" },
  { key: "section-demo-bow", file: "detail-16x9-3.svg", alt: "ภาพตัวอย่างลวดลายบริเวณหัวเรือพระ (ข้อมูลสาธิต)", ratio: "detail" },
  { key: "section-demo-stern", file: "detail-16x9-4.svg", alt: "ภาพตัวอย่างลวดลายบริเวณท้ายเรือพระ (ข้อมูลสาธิต)", ratio: "detail" },
  { key: "section-demo-flank", file: "detail-16x9-5.svg", alt: "ภาพตัวอย่างแนวลายข้างลำเรือพระ (ข้อมูลสาธิต)", ratio: "detail" },
  { key: "section-demo-base", file: "detail-16x9-6.svg", alt: "ภาพตัวอย่างฐานเรือพระ (ข้อมูลสาธิต)", ratio: "detail" },
  { key: "craft-demo-macro", file: "craft-4x5-1.svg", alt: "ภาพตัวอย่างงานกระดาษระยะใกล้ขณะตอกลาย (ข้อมูลสาธิต)", ratio: "macro" },
  { key: "craft-demo-macro-2", file: "craft-4x5-2.svg", alt: "ภาพตัวอย่างชิ้นลายกระดาษที่ตอกเสร็จแล้ว (ข้อมูลสาธิต)", ratio: "macro" },
  { key: "pattern-demo-kanok", file: "pattern-1x1-1.svg", alt: "ภาพตัวอย่างลายกระหนกใบเทศ (ข้อมูลสาธิต)", ratio: "swatch" },
  { key: "pattern-demo-flower", file: "pattern-1x1-2.svg", alt: "ภาพตัวอย่างลายดอกพิกุล (ข้อมูลสาธิต)", ratio: "swatch" },
  { key: "pattern-demo-wave", file: "pattern-1x1-3.svg", alt: "ภาพตัวอย่างลายจังหวะคลื่น (ข้อมูลสาธิต)", ratio: "swatch" },
  { key: "pattern-demo-naga", file: "pattern-1x1-4.svg", alt: "ภาพตัวอย่างลายเกล็ดนาค (ข้อมูลสาธิต)", ratio: "swatch" },
  { key: "pattern-demo-krajang", file: "pattern-1x1-5.svg", alt: "ภาพตัวอย่างลายกระจังขอบ (ข้อมูลสาธิต)", ratio: "swatch" },
  { key: "pattern-demo-flame", file: "pattern-1x1-6.svg", alt: "ภาพตัวอย่างลายเปลวยอด (ข้อมูลสาธิต)", ratio: "swatch" },
  { key: "master-demo-somchai", file: "portrait-4x5-1.svg", alt: "ภาพแทนช่างสมชาย บุญช่วย ซึ่งเป็นบุคคลสมมติ", ratio: "macro" },
  { key: "master-demo-lamai", file: "portrait-4x5-2.svg", alt: "ภาพแทนช่างละไม ศรีนวล ซึ่งเป็นบุคคลสมมติ", ratio: "macro" },
  { key: "master-demo-prasert", file: "portrait-4x5-3.svg", alt: "ภาพแทนช่างประเสริฐ ทองอยู่ ซึ่งเป็นบุคคลสมมติ", ratio: "macro" },
];

async function upsertMedia({ key, file, alt, ratio, credit }: MediaSpec) {
  const { width, height } = RATIO[ratio];
  const url = `/placeholders/${file}`;
  return prisma.media.upsert({
    where: { provider_storageKey: { provider: MediaProvider.PLACEHOLDER, storageKey: key } },
    update: { url, alt, width, height, credit: credit ?? DEMO_CREDIT },
    create: {
      kind: MediaKind.IMAGE,
      provider: MediaProvider.PLACEHOLDER,
      storageKey: key,
      url,
      alt,
      mimeType: "image/svg+xml",
      width,
      height,
      credit: credit ?? DEMO_CREDIT,
      isDemo: true,
    },
  });
}

async function main() {
  const mediaByKey = new Map<string, { id: string }>();
  for (const spec of mediaSpecs) {
    mediaByKey.set(spec.key, await upsertMedia(spec));
  }
  const media = (key: string) => {
    const record = mediaByKey.get(key);
    if (!record) throw new Error(`Missing seeded media: ${key}`);
    return record.id;
  };

  const process = await prisma.knowledgeProcess.upsert({
    where: { slug: "paper-decoration-demo" },
    update: {},
    create: {
      slug: "paper-decoration-demo",
      title: "จากกระดาษสู่เรือพระ (กระบวนการสาธิต)",
      description: "ลำดับงานสมมติสำหรับทดสอบการเชื่อมโยงองค์ความรู้ รอการตรวจสอบจากช่างในพื้นที่",
      isDemo: true,
    },
  });

  const stepDefinitions = [
    { slug: "prepare-materials-demo", title: "เตรียมวัสดุ", description: "สำรวจคุณสมบัติของกระดาษและเตรียมพื้นที่ทำงาน", importance: "การรู้จักวัสดุช่วยกำหนดขนาดลายและวิธีทำงานในขั้นต่อไป", tip: "ข้อมูลสาธิต: ทดลองกับเศษกระดาษก่อนเริ่มชิ้นงาน", warning: "ข้อมูลความปลอดภัยนี้ต้องให้ช่างและผู้เชี่ยวชาญตรวจสอบ" },
    { slug: "pattern-design-demo", title: "ออกแบบลวดลาย", description: "วางจังหวะเส้นและขนาดของลายให้สัมพันธ์กับตำแหน่งบนเรือ", importance: "แบบร่างทำหน้าที่เป็นภาษากลางระหว่างผู้วาด ผู้ทำแม่แบบ และผู้ประกอบ", tip: "ข้อมูลสาธิต: มองแบบทั้งระยะใกล้และไกล", warning: null },
    { slug: "template-making-demo", title: "ทำแม่แบบ", description: "ถ่ายทอดแบบร่างไปสู่แม่แบบที่ใช้ทำซ้ำ", importance: "แม่แบบช่วยรักษาสัดส่วนเมื่อองค์ประกอบหนึ่งต้องเกิดซ้ำหลายครั้ง", tip: "ข้อมูลสาธิต: ทำเครื่องหมายแนวอ้างอิงไว้บนแม่แบบ", warning: "เก็บแม่แบบให้พ้นความชื้น — รอการตรวจสอบภาคสนาม" },
    { slug: "paper-cutting-demo", title: "ตอกลาย", description: "ทดลองสร้างช่องและแนวลายบนกระดาษตามแม่แบบ", importance: "จังหวะของช่องว่างมีผลต่อความต่อเนื่องของลายเมื่อประกอบ", tip: "ข้อมูลสาธิต: เริ่มจากส่วนในของลายก่อนขอบนอก", warning: "เครื่องมือมีคม ต้องใช้ภายใต้การดูแลของผู้มีประสบการณ์" },
    { slug: "embossing-demo", title: "อัดดอก", description: "เพิ่มมิติให้ชิ้นกระดาษด้วยแรงกดตามตำแหน่งที่ออกแบบ", importance: "ระดับนูนและร่องทำให้พื้นผิวตอบรับแสงต่างกัน", tip: "ข้อมูลสาธิต: ค่อย ๆ เพิ่มแรงกดเพื่อสังเกตการเปลี่ยนรูป", warning: "วิธีและเครื่องมือจริงต้องยืนยันกับช่างในพื้นที่" },
    { slug: "detail-finishing-demo", title: "ตกแต่งรายละเอียด", description: "ตรวจขอบ รอยต่อ และผิวของชิ้นลายก่อนประกอบ", importance: "รายละเอียดเล็กส่งผลต่อจังหวะรวมเมื่อชิ้นงานเรียงต่อกัน", tip: "ข้อมูลสาธิต: วางชิ้นงานเรียงกันก่อนยึดติด", warning: null },
    { slug: "boat-installation-demo", title: "ประดับบนเรือพระ", description: "ประกอบชิ้นลายบนโครงและตรวจความต่อเนื่องเมื่อมองจากระยะไกล", importance: "ขั้นนี้เชื่อมงานกระดาษแต่ละชิ้นเข้ากับสัดส่วนและเรื่องเล่าของเรือทั้งลำ", tip: "ข้อมูลสาธิต: ตรวจแนวจากหลายมุมก่อนยึดถาวร", warning: "ขั้นตอนติดตั้งจริงต้องประเมินโครงสร้าง พื้นที่สูง และความปลอดภัยโดยผู้รับผิดชอบ" },
  ] as const;

  await prisma.processStep.updateMany({ where: { processId: process.id }, data: { position: { increment: 100 } } });
  const steps = [];
  for (const [position, definition] of stepDefinitions.entries()) {
    const stepMedia = await upsertMedia({
      key: `step-${definition.slug}`,
      file: `process-3x2-${position + 1}.svg`,
      alt: `ภาพตัวอย่างขั้น ${definition.title} (ข้อมูลสาธิต)`,
      ratio: "step",
      credit: "ภาพตัวอย่าง ไม่ใช่หลักฐานกระบวนการจริง",
    });
    const data = {
      processId: process.id,
      title: definition.title,
      description: definition.description,
      importance: definition.importance,
      instructions: [
        { order: 1, text: "สำรวจตัวอย่างและเตรียมองค์ประกอบตามข้อมูลสาธิต" },
        { order: 2, text: "ทดลองขั้นตอนในขนาดเล็กและบันทึกผล" },
        { order: 3, text: "ตรวจชิ้นงานก่อนส่งต่อไปยังขั้นถัดไป" },
      ],
      tips: definition.tip,
      warnings: definition.warning,
      coverMediaId: stepMedia.id,
      position: position + 1,
      isDemo: true,
    };
    const step = await prisma.processStep.upsert({ where: { slug: definition.slug }, update: data, create: { slug: definition.slug, ...data } });
    await prisma.stepMedia.upsert({
      where: { stepId_position: { stepId: step.id, position: 1 } },
      update: { mediaId: stepMedia.id, caption: `ภาพลำดับงานสาธิต: ${definition.title}` },
      create: { stepId: step.id, mediaId: stepMedia.id, role: "INSTRUCTION", position: 1, caption: `ภาพลำดับงานสาธิต: ${definition.title}` },
    });
    steps.push(step);
  }

  /**
   * A handful of steps carry a second image at a different focal length. The homepage
   * frames these: the craft section wants a 4:5 macro rather than the 3:2 documentation
   * cover, and the closing section wants the finished boat.
   */
  const stepCloseups = [
    { stepSlug: "paper-cutting-demo", mediaKey: "craft-demo-macro", caption: "ภาพระยะใกล้ขณะตอกลายบนกระดาษ (ข้อมูลสาธิต)" },
    { stepSlug: "embossing-demo", mediaKey: "craft-demo-macro-2", caption: "ภาพระยะใกล้ชิ้นลายหลังอัดดอก (ข้อมูลสาธิต)" },
    { stepSlug: "boat-installation-demo", mediaKey: "closing-demo", caption: "ภาพเรือพระหลังประดับลวดลายเสร็จ (ข้อมูลสาธิต)" },
  ] as const;
  for (const closeup of stepCloseups) {
    const step = steps.find((candidate) => candidate.slug === closeup.stepSlug);
    if (!step) continue;
    await prisma.stepMedia.upsert({
      where: { stepId_position: { stepId: step.id, position: 2 } },
      update: { mediaId: media(closeup.mediaKey), caption: closeup.caption },
      create: { stepId: step.id, mediaId: media(closeup.mediaKey), role: "INSTRUCTION", position: 2, caption: closeup.caption },
    });
  }

  const patternDefinitions = [
    { slug: "kanok-bai-thet-demo", name: "ลายกระหนกใบเทศ", localName: null, category: PatternCategory.FOLIAGE, mediaKey: "pattern-demo-kanok", characteristics: "เส้นโค้งต่อเนื่องและปลายลายสะบัด", meaning: "ใช้เป็นจังหวะนำสายตาในข้อมูลสาธิต" },
    { slug: "dok-phikun-demo", name: "ลายดอกพิกุล", localName: null, category: PatternCategory.FLORAL, mediaKey: "pattern-demo-flower", characteristics: "รูปดอกขนาดเล็กวางซ้ำเป็นจังหวะ", meaning: null },
    { slug: "wave-rhythm-demo", name: "ลายจังหวะคลื่น", localName: "ลายน้ำไหล", category: PatternCategory.GEOMETRIC, mediaKey: "pattern-demo-wave", characteristics: "เส้นโค้งสลับต่อเนื่องคล้ายผิวน้ำ", meaning: "สื่อถึงสายน้ำเฉพาะในเรื่องเล่าสมมติชุดนี้" },
    { slug: "naga-scale-demo", name: "ลายเกล็ดนาค", localName: null, category: PatternCategory.MYTHICAL, mediaKey: "pattern-demo-naga", characteristics: "รูปเกล็ดซ้อนเหลื่อมกันเป็นชั้น", meaning: "ความหมายชุดนี้แต่งขึ้นเพื่อทดสอบระบบ" },
    { slug: "krajang-frame-demo", name: "ลายกระจังขอบ", localName: "ลายกระจังตาอ้อย", category: PatternCategory.GEOMETRIC, mediaKey: "pattern-demo-krajang", characteristics: "รูปสามเหลี่ยมเรียงต่อเนื่องใช้ปิดแนวขอบ", meaning: null },
    { slug: "flame-crest-demo", name: "ลายเปลวยอด", localName: null, category: PatternCategory.MYTHICAL, mediaKey: "pattern-demo-flame", characteristics: "ปลายลายชี้ขึ้นเป็นจังหวะไล่ขนาด", meaning: "ใช้ทดสอบการวางลายบริเวณยอดในข้อมูลสาธิต" },
  ] as const;
  const patterns = [];
  for (const definition of patternDefinitions) {
    const data = {
      name: definition.name,
      localName: definition.localName,
      category: definition.category,
      imageMediaId: media(definition.mediaKey),
      characteristics: definition.characteristics,
      meaning: definition.meaning,
      isDemo: true,
    };
    patterns.push(await prisma.pattern.upsert({ where: { slug: definition.slug }, update: data, create: { slug: definition.slug, ...data } }));
  }

  const masterDefinitions = [
    {
      slug: "somchai-boonchuai-demo",
      name: "ช่างสมชาย บุญช่วย",
      mediaKey: "master-demo-somchai",
      biography: "ช่างสมมติผู้ดูแลการวางจังหวะลายและการประกอบชิ้นงานกระดาษบนโครงเรือ ข้อมูลชุดนี้สร้างขึ้นเพื่อทดสอบระบบและรอการสัมภาษณ์จริง",
      quote: "ลายที่ดีต้องอ่านได้ทั้งใกล้และไกล — ข้อความสมมติ",
      practiceSinceYear: 2532,
      expertise: ["การวางจังหวะลาย", "การประกอบชิ้นงานบนโครงเรือ", "การควบคุมสัดส่วนลายระยะไกล"],
    },
    {
      slug: "lamai-srinuan-demo",
      name: "ช่างละไม ศรีนวล",
      mediaKey: "master-demo-lamai",
      biography: "ช่างสมมติผู้ถ่ายทอดการตัดลายและการจัดช่องไฟ ข้อมูลชุดนี้รอการยืนยันจากผู้รู้ในชุมชน",
      quote: "ช่องว่างระหว่างลาย สำคัญเท่ากับตัวลาย — ข้อความสมมติ",
      practiceSinceYear: 2538,
      expertise: ["การตอกลายกระดาษ", "การจัดช่องไฟ"],
    },
    {
      slug: "prasert-thongyu-demo",
      name: "ช่างประเสริฐ ทองอยู่",
      mediaKey: "master-demo-prasert",
      biography: "ช่างสมมติผู้ดูแลงานอัดดอกและการตกแต่งผิวงาน ข้อมูลชุดนี้ใช้ทดสอบการเชื่อมโยงช่างกับขั้นตอน",
      quote: "งานกระดาษสอนให้ใจเย็นก่อนสอนให้มือแม่น — ข้อความสมมติ",
      practiceSinceYear: 2545,
      expertise: ["การอัดดอก", "การตกแต่งผิวงาน", "การสอนผู้เรียนรุ่นใหม่"],
    },
  ] as const;
  const masters = [];
  for (const definition of masterDefinitions) {
    const data = {
      name: definition.name,
      portraitMediaId: media(definition.mediaKey),
      biography: definition.biography,
      quote: definition.quote,
      practiceSinceYear: definition.practiceSinceYear,
      isDemo: true,
    };
    const master = await prisma.master.upsert({ where: { slug: definition.slug }, update: data, create: { slug: definition.slug, ...data } });
    for (const title of definition.expertise) {
      await prisma.masterExpertise.upsert({
        where: { masterId_title: { masterId: master.id, title } },
        update: {},
        create: { masterId: master.id, title },
      });
    }
    masters.push(master);
  }

  const materials = [];
  for (const [slug, name, description] of [
    ["paper-demo", "กระดาษสำหรับทดลอง", "กระดาษตัวอย่างสำหรับทดสอบระบบ ยังไม่ระบุชนิดที่ใช้จริง"],
    ["adhesive-demo", "วัสดุยึดติดสำหรับทดลอง", "ชื่อกลางสำหรับโครงสร้างข้อมูล ต้องแทนด้วยวัสดุที่ช่างยืนยัน"],
    ["color-paper-demo", "กระดาษสีสำหรับทดลอง", "ชุดสีสมมติเพื่อทดสอบการจัดหมวดวัสดุ"],
  ] as const) {
    materials.push(await prisma.material.upsert({
      where: { slug }, update: { name, description }, create: { slug, name, description, isDemo: true },
    }));
  }

  const tools = [];
  for (const [slug, name, description] of [
    ["pencil-demo", "ดินสอร่างแบบ", "เครื่องมือเขียนสำหรับข้อมูลสาธิต"],
    ["template-demo", "แม่แบบทดลอง", "แม่แบบจำลองที่ยังไม่อ้างอิงเครื่องมือจริงของช่าง"],
    ["cutting-tool-demo", "เครื่องมือตัดลาย", "ชื่อกลางสำหรับเครื่องมือมีคม รอการระบุชนิดจากภาคสนาม"],
  ] as const) {
    tools.push(await prisma.tool.upsert({
      where: { slug }, update: { name, description }, create: { slug, name, description, isDemo: true },
    }));
  }

  const techniques = [];
  for (const [slug, name, description] of [
    ["repeat-rhythm-demo", "การวางจังหวะซ้ำ", "แนวคิดสาธิตสำหรับอธิบายการเรียงองค์ประกอบ"],
    ["template-transfer-demo", "การถ่ายแบบ", "คำอธิบายชั่วคราวสำหรับเชื่อมแบบร่างกับแม่แบบ"],
    ["layering-demo", "การซ้อนชั้น", "แนวคิดสาธิตสำหรับสร้างมิติของผิวงาน"],
  ] as const) {
    techniques.push(await prisma.technique.upsert({
      where: { slug }, update: { name, description }, create: { slug, name, description, isDemo: true },
    }));
  }

  for (const [index, step] of steps.entries()) {
    const material = materials[index % materials.length];
    const tool = tools[index % tools.length];
    const technique = techniques[index % techniques.length];
    const master = masters[index % masters.length];
    await prisma.stepMaterial.upsert({
      where: { stepId_materialId: { stepId: step.id, materialId: material.id } },
      update: {}, create: { stepId: step.id, materialId: material.id, quantityNote: "ปริมาณทดลอง — รอข้อมูลภาคสนาม" },
    });
    await prisma.stepTool.upsert({
      where: { stepId_toolId: { stepId: step.id, toolId: tool.id } },
      update: {}, create: { stepId: step.id, toolId: tool.id, usageNote: "วิธีใช้สาธิต ต้องผ่านการตรวจสอบ" },
    });
    await prisma.stepTechnique.upsert({
      where: { stepId_techniqueId: { stepId: step.id, techniqueId: technique.id } },
      update: {}, create: { stepId: step.id, techniqueId: technique.id, note: "คำอธิบายเทคนิคฉบับสาธิต" },
    });
    await prisma.masterStep.upsert({
      where: { masterId_stepId: { masterId: master.id, stepId: step.id } },
      update: {}, create: { masterId: master.id, stepId: step.id, contribution: "ผู้ให้คำแนะนำสมมติสำหรับทดสอบระบบ" },
    });
  }

  const templeDefinitions = [
    { slug: "wat-don-pradu-demo", name: "วัดดอนประดู่ (ข้อมูลสาธิต)", community: "ชุมชนดอนประดู่ อำเภอปากพะยูน" },
    { slug: "wat-khlong-thian-demo", name: "วัดคลองเทียน (ข้อมูลสาธิต)", community: "ชุมชนคลองเทียน อำเภอปากพะยูน" },
    { slug: "wat-pak-phayun-demo", name: "วัดปากพะยูน (ข้อมูลสาธิต)", community: "ชุมชนตลาดปากพะยูน อำเภอปากพะยูน" },
  ] as const;
  const temples = new Map<string, { id: string }>();
  for (const definition of templeDefinitions) {
    temples.set(definition.slug, await prisma.temple.upsert({
      where: { slug: definition.slug },
      update: { name: definition.name, community: definition.community },
      create: {
        slug: definition.slug,
        name: definition.name,
        community: definition.community,
        description: "สถานที่และรายละเอียดชุดนี้แต่งขึ้นเพื่อทดสอบระบบเท่านั้น",
        isDemo: true,
      },
    }));
  }
  const temple = (slug: string) => {
    const record = temples.get(slug);
    if (!record) throw new Error(`Missing seeded temple: ${slug}`);
    return record.id;
  };

  const boatDefinitions = [
    {
      slug: "wat-don-pradu-2569-demo",
      name: "เรือพระวัดดอนประดู่",
      year: 2569,
      concept: "สายน้ำแห่งศรัทธา (แนวคิดสมมติ)",
      summary: "เรือพระจำลองสำหรับทดสอบประสบการณ์สำรวจแบบโต้ตอบ เนื้อหาทั้งหมดรอการตรวจสอบภาคสนาม",
      templeSlug: "wat-don-pradu-demo",
      coverKey: "boat-demo-cover",
      story: "เรื่องเล่านี้จัดทำขึ้นเพื่อทดสอบหน้ารายละเอียดและยังไม่ใช่ข้อมูลประวัติศาสตร์ที่ผ่านการรับรอง",
      sections: [
        { slug: "yot-ruea", name: "ยอดเรือ", x: 50, y: 15, mediaKey: "section-demo-chofa", description: "ส่วนยอดสร้างจังหวะแนวตั้งและเป็นจุดนำสายตาขององค์ประกอบ", meaning: "คำอธิบายความหมายนี้เป็นข้อมูลสมมติ", patterns: [0, 5] },
        { slug: "busabok", name: "บุษบกกลางเรือ", x: 50, y: 48, mediaKey: "section-demo-mandapa", description: "พื้นที่ศูนย์กลางขององค์ประกอบ ใช้ทดลองการเชื่อมโยงลายหลายชนิด", meaning: null, patterns: [0, 1] },
        { slug: "hua-ruea", name: "หัวเรือ", x: 20, y: 70, mediaKey: "section-demo-bow", description: "แนวลายบริเวณหัวเรือช่วยพาสายตาเข้าสู่ตัวเรือ", meaning: "เรื่องเล่าสมมติเปรียบจังหวะลายกับการเคลื่อนของสายน้ำ", patterns: [2] },
        { slug: "thai-ruea", name: "ท้ายเรือ", x: 79, y: 64, mediaKey: "section-demo-stern", description: "ส่วนท้ายปิดจังหวะของลายและรับน้ำหนักสายตาให้สมดุลกับหัวเรือ", meaning: "ข้อมูลสมมติสำหรับทดสอบการเล่าเรื่องรายจุด", patterns: [3] },
        { slug: "khang-lam", name: "แนวลายข้างลำ", x: 38, y: 78, mediaKey: "section-demo-flank", description: "แถบลายด้านข้างทำหน้าที่เชื่อมหัวเรือกับท้ายเรือให้อ่านเป็นผืนเดียว", meaning: null, patterns: [4] },
      ],
    },
    {
      slug: "wat-khlong-thian-2568-demo",
      name: "เรือพระวัดคลองเทียน",
      year: 2568,
      concept: "ป่าหิมพานต์กลางลำน้ำ (แนวคิดสมมติ)",
      summary: "ชุดข้อมูลสาธิตชุดที่สอง ใช้ทดสอบการแสดงผลเมื่อคลังมีเรือมากกว่าหนึ่งลำ",
      templeSlug: "wat-khlong-thian-demo",
      coverKey: "boat-demo-cover-2",
      story: "เรื่องเล่าสมมติเกี่ยวกับการตีความป่าหิมพานต์ด้วยงานกระดาษ รอการตรวจสอบจากชุมชน",
      sections: [
        { slug: "yot-ruea", name: "ยอดเรือ", x: 49, y: 16, mediaKey: "section-demo-chofa", description: "ยอดเรือในชุดข้อมูลสาธิตนี้ใช้ทดสอบการวางลายเปลว", meaning: null, patterns: [5] },
        { slug: "busabok", name: "บุษบกกลางเรือ", x: 52, y: 45, mediaKey: "section-demo-mandapa", description: "พื้นที่กลางลำสำหรับทดสอบการเชื่อมลายหลายชุดเข้าด้วยกัน", meaning: null, patterns: [3, 4] },
        { slug: "than-ruea", name: "ฐานเรือ", x: 50, y: 80, mediaKey: "section-demo-base", description: "ฐานรองรับน้ำหนักทางสายตาของทั้งลำในข้อมูลสาธิต", meaning: null, patterns: [2] },
      ],
    },
    {
      slug: "wat-pak-phayun-2567-demo",
      name: "เรือพระวัดปากพะยูน",
      year: 2567,
      concept: "แสงแรกของเดือนสิบเอ็ด (แนวคิดสมมติ)",
      summary: "ชุดข้อมูลสาธิตชุดที่สาม ใช้ทดสอบการเรียงลำดับตามปีและการสลับเรือเด่น",
      templeSlug: "wat-pak-phayun-demo",
      coverKey: "boat-demo-cover-3",
      story: "เรื่องเล่าสมมติเกี่ยวกับจังหวะแสงยามเช้าในงานประเพณี รอการตรวจสอบ",
      sections: [
        { slug: "yot-ruea", name: "ยอดเรือ", x: 50, y: 18, mediaKey: "section-demo-chofa", description: "ยอดเรือชุดสาธิตสำหรับทดสอบการแสดงจุดสำรวจ", meaning: null, patterns: [0] },
        { slug: "hua-ruea", name: "หัวเรือ", x: 24, y: 68, mediaKey: "section-demo-bow", description: "หัวเรือชุดสาธิตสำหรับทดสอบการเชื่อมลายกับช่าง", meaning: null, patterns: [1] },
        { slug: "thai-ruea", name: "ท้ายเรือ", x: 76, y: 66, mediaKey: "section-demo-stern", description: "ท้ายเรือชุดสาธิตสำหรับทดสอบการปิดจังหวะลาย", meaning: null, patterns: [4] },
      ],
    },
  ] as const;

  const boats = [];
  for (const definition of boatDefinitions) {
    const boat = await prisma.boat.upsert({
      where: { slug: definition.slug },
      update: { coverMediaId: media(definition.coverKey), concept: definition.concept, summary: definition.summary },
      create: {
        slug: definition.slug,
        name: definition.name,
        year: definition.year,
        concept: definition.concept,
        summary: definition.summary,
        competition: "ข้อมูลสาธิต — ไม่ใช่รายการแข่งขันจริง",
        templeId: temple(definition.templeSlug),
        coverMediaId: media(definition.coverKey),
        isDemo: true,
      },
    });
    boats.push(boat);

    await prisma.boatStory.upsert({
      where: { boatId_position: { boatId: boat.id, position: 1 } },
      update: { body: definition.story },
      create: {
        boatId: boat.id,
        title: "เรื่องราวของเรือลำนี้",
        body: definition.story,
        kind: BoatStoryKind.MAIN,
        position: 1,
        isDemo: true,
      },
    });

    for (const [index, section] of definition.sections.entries()) {
      const record = await prisma.boatSection.upsert({
        where: { boatId_slug: { boatId: boat.id, slug: section.slug } },
        update: { name: section.name, x: section.x, y: section.y, position: index + 1, closeupMediaId: media(section.mediaKey), description: section.description, meaning: section.meaning },
        create: {
          boatId: boat.id,
          slug: section.slug,
          name: section.name,
          x: section.x,
          y: section.y,
          position: index + 1,
          closeupMediaId: media(section.mediaKey),
          description: section.description,
          meaning: section.meaning,
          isDemo: true,
        },
      });
      for (const patternIndex of section.patterns) {
        const patternId = patterns[patternIndex].id;
        await prisma.boatSectionPattern.upsert({
          where: { sectionId_patternId: { sectionId: record.id, patternId } },
          update: {},
          create: { sectionId: record.id, patternId },
        });
        await prisma.boatPattern.upsert({
          where: { boatId_patternId: { boatId: boat.id, patternId } },
          update: {},
          create: { boatId: boat.id, patternId },
        });
      }
    }
  }

  for (const master of masters) {
    for (const boat of boats) {
      await prisma.masterBoat.upsert({
        where: { masterId_boatId: { masterId: master.id, boatId: boat.id } },
        update: {}, create: { masterId: master.id, boatId: boat.id, contribution: "บทบาทสมมติสำหรับทดสอบความสัมพันธ์" },
      });
    }
  }
  for (const [index, pattern] of patterns.entries()) {
    const master = masters[index % masters.length];
    await prisma.masterPattern.upsert({
      where: { masterId_patternId: { masterId: master.id, patternId: pattern.id } },
      update: {}, create: { masterId: master.id, patternId: pattern.id },
    });
    await prisma.patternStep.upsert({
      where: { patternId_stepId: { patternId: pattern.id, stepId: steps[index % steps.length].id } },
      update: {}, create: { patternId: pattern.id, stepId: steps[index % steps.length].id },
    });
  }

  const course = await prisma.course.upsert({
    where: { slug: "paper-craft-path-demo" },
    update: {},
    create: {
      slug: "paper-craft-path-demo",
      title: "เส้นทางการเรียนรู้งานกระดาษเรือพระ",
      description: "ลำดับบทเรียนสาธิตที่พาผู้เรียนจากการมองเห็นลวดลาย ไปสู่การลงมือสร้างชิ้นงานของตนเอง",
      isDemo: true,
    },
  });
  const lessonTitles = [
    "รู้จักเรือพระปากพะยูน",
    "อ่านเรื่องราวจากลวดลาย",
    "จำแนกประเภทลวดลาย",
    "รู้จักวัสดุและเครื่องมือ",
    "ฝึกออกแบบลายของตนเอง",
    "ลงมือตอกลายและอัดดอก",
    "สร้างผลงานและนำเสนอ",
  ];
  for (const [index, title] of lessonTitles.entries()) {
    await prisma.lesson.upsert({
      where: { courseId_slug: { courseId: course.id, slug: `lesson-${index + 1}-demo` } },
      update: { title, position: index + 1 },
      create: { courseId: course.id, slug: `lesson-${index + 1}-demo`, title, position: index + 1 },
    });
  }

  const workDefinitions = [
    { slug: "work-rhythm-study-demo", title: "การทดลองจังหวะลายกระหนก", learner: "ผู้เรียน ก (ข้อมูลสาธิต)", email: "learner-a.demo@example.invalid", patternIndex: 0, inspiration: "แรงบันดาลใจจากการสังเกตจังหวะลายบนยอดเรือในข้อมูลสาธิต", concept: "ทดลองย่อจังหวะลายกระหนกให้เหลือสามหน่วยแล้ววางซ้ำในแนวตั้ง", reflection: "สิ่งที่ยากที่สุดคือการรักษาช่องไฟให้เท่ากันเมื่อย่อขนาดลาย" },
    { slug: "work-flower-grid-demo", title: "ตารางดอกพิกุลร่วมสมัย", learner: "ผู้เรียน ข (ข้อมูลสาธิต)", email: "learner-b.demo@example.invalid", patternIndex: 1, inspiration: "แรงบันดาลใจจากลายดอกพิกุลในชุดข้อมูลสาธิต", concept: "จัดดอกพิกุลลงบนตารางแล้วปรับขนาดให้ไล่ระดับจากกลางออกขอบ", reflection: "เมื่อปรับขนาดไล่ระดับ สายตาจะเคลื่อนจากกลางชิ้นงานออกไปเอง" },
    { slug: "work-wave-line-demo", title: "เส้นคลื่นบนกระดาษสองชั้น", learner: "ผู้เรียน ค (ข้อมูลสาธิต)", email: "learner-c.demo@example.invalid", patternIndex: 2, inspiration: "แรงบันดาลใจจากลายจังหวะคลื่นในชุดข้อมูลสาธิต", concept: "ซ้อนกระดาษสองชั้นเพื่อให้เส้นคลื่นเกิดเงาและมีความลึก", reflection: "การซ้อนชั้นทำให้ชิ้นงานอ่านได้ต่างกันเมื่อแสงเปลี่ยนทิศ" },
    { slug: "work-naga-remix-demo", title: "เกล็ดนาคในรูปทรงเรขาคณิต", learner: "ผู้เรียน ง (ข้อมูลสาธิต)", email: "learner-d.demo@example.invalid", patternIndex: 3, inspiration: "แรงบันดาลใจจากลายเกล็ดนาคในชุดข้อมูลสาธิต", concept: "แทนเกล็ดโค้งด้วยรูปหกเหลี่ยมเพื่อทดลองความร่วมสมัย", reflection: "รูปทรงเปลี่ยนไปแต่จังหวะการซ้อนเหลื่อมยังคงอ่านว่าเป็นเกล็ด" },
  ] as const;
  for (const [index, definition] of workDefinitions.entries()) {
    const user = await prisma.user.upsert({
      where: { email: definition.email },
      update: { name: definition.learner },
      create: { email: definition.email, name: definition.learner, role: Role.LEARNER },
    });
    const work = await prisma.studentWork.upsert({
      where: { slug: definition.slug },
      update: { title: definition.title, concept: definition.concept, published: true },
      create: {
        slug: definition.slug,
        title: definition.title,
        userId: user.id,
        patternId: patterns[definition.patternIndex].id,
        inspiration: definition.inspiration,
        concept: definition.concept,
        reflection: definition.reflection,
        published: true,
        isDemo: true,
      },
    });
    const existing = await prisma.studentWorkMedia.findFirst({ where: { workId: work.id, position: 1 } });
    const workMedia = {
      stage: "FINAL",
      url: `/placeholders/work-4x5-${index + 1}.svg`,
      alt: `ภาพตัวอย่างผลงาน ${definition.title} (ข้อมูลสาธิต)`,
      position: 1,
    };
    if (existing) {
      await prisma.studentWorkMedia.update({ where: { id: existing.id }, data: workMedia });
    } else {
      await prisma.studentWorkMedia.create({ data: { workId: work.id, ...workMedia } });
    }
  }

  console.log(`Seeded ${boats.length} boats, ${patterns.length} patterns, ${masters.length} masters, ${lessonTitles.length} lessons and ${workDefinitions.length} learner works.`);
}

main().finally(() => prisma.$disconnect());
