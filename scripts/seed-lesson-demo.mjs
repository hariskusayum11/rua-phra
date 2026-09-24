/**
 * Content for the demo course, so the lesson pages can be seen and tested.
 *
 * Deliberately written as instructions for using the archive rather than as claims about
 * the craft. Nobody has taught me how a rua phra is made, and the demo course is a fixture,
 * so inventing lesson prose about cutting patterns would put fabricated cultural knowledge
 * in front of a learner behind nothing but a grey "demo" label.
 *
 * The quiz questions are answerable from records already in the database, so the answer key
 * is checkable rather than made up. Real lessons are for the project team to write, through
 * Admin -> บทเรียน.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const course = await prisma.course.findFirst({
  where: { isDemo: true },
  include: { lessons: { orderBy: { position: "asc" } } },
});
if (!course) {
  console.error("ไม่พบชุดบทเรียนสาธิต — รัน npm run db:seed ก่อน");
  process.exit(1);
}

const boat = await prisma.boat.findUnique({ where: { slug: "rua-phra-wat-rattanaram-2568" }, select: { id: true, year: true, coverMediaId: true, temple: { select: { name: true } } } });
const steps = await prisma.processStep.findMany({ orderBy: { position: "asc" }, select: { slug: true, title: true } });

const lessonOne = course.lessons[0];
const lessonTwo = course.lessons[1];

async function replaceContents(lesson, blocks) {
  await prisma.lessonContent.deleteMany({ where: { lessonId: lesson.id } });
  if (blocks.length === 0) return;
  await prisma.lessonContent.createMany({
    data: blocks.map((block, index) => ({ lessonId: lesson.id, kind: block.kind, body: block.body, position: index + 1 })),
  });
  console.log(`บทที่ ${lesson.position} "${lesson.title}" — ${blocks.length} ส่วน`);
}

await replaceContents(lessonOne, [
  {
    kind: "text",
    body: {
      text:
        "บทนี้เป็นตัวอย่างโครงบทเรียน ใช้เพื่อดูว่าหน้าบทเรียนทำงานอย่างไร เนื้อหาจริงของหลักสูตรยังรอการเขียนร่วมกับช่างและครูในพื้นที่\n\n" +
        "สิ่งที่ใช้ได้จริงแล้วคือบันทึกภาคสนามในคลังนี้ ทั้งภาพเรือพระ ลวดลายที่บันทึกไว้ และลำดับขั้นตอนการทำงาน ทุกหน้าที่ยังไม่ผ่านการตรวจสอบจะมีข้อความกำกับไว้เสมอ",
    },
  },
  ...(boat?.coverMediaId
    ? [{ kind: "image", body: { mediaId: boat.coverMediaId, caption: `เรือพระ${boat.temple.name} พ.ศ. ${boat.year}` } }]
    : []),
  ...(steps[0] ? [{ kind: "step", body: { stepSlug: steps[0].slug, note: "ตัวอย่างการลิงก์จากบทเรียนไปยังบันทึกขั้นตอนจริงในคลัง" } }] : []),
  {
    kind: "activity",
    body: {
      title: "ลองอ่านเรือหนึ่งลำ",
      body: "เปิดหน้าเรือพระหนึ่งลำ แล้วกดจุดสำรวจบนภาพให้ครบทุกจุด จดไว้ว่าจุดไหนที่คำอธิบายยังไม่มี หรือยังไม่ได้บันทึกชื่อลาย",
      materials: ["โทรศัพท์หรือคอมพิวเตอร์ที่เปิดเว็บไซต์ได้", "สมุดจดหรือไฟล์บันทึก"],
    },
  },
]);

if (lessonTwo) {
  await replaceContents(lessonTwo, [
    {
      kind: "text",
      body: {
        text:
          "บทนี้ยังไม่มีเนื้อหาจริงเช่นกัน แต่แสดงให้เห็นว่าบทเรียนสามารถอ้างถึงขั้นตอนการทำงานที่บันทึกไว้แล้วได้โดยตรง แทนที่จะเขียนซ้ำ",
      },
    },
    ...steps.slice(1, 3).map((step) => ({ kind: "step", body: { stepSlug: step.slug } })),
  ]);
}

// One quiz, on facts that are already recorded, so the key is checkable.
await prisma.quiz.deleteMany({ where: { lessonId: lessonOne.id } });
if (boat) {
  const quiz = await prisma.quiz.create({ data: { lessonId: lessonOne.id, title: "ทบทวนท้ายบท" } });
  const questions = [
    {
      prompt: `เรือพระที่บันทึกไว้ในคลังนี้มาจากวัดใด`,
      choices: [
        { text: boat.temple.name, correct: true },
        { text: "วัดพระมหาธาตุวรมหาวิหาร", correct: false },
        { text: "วัดเขียนบางแก้ว", correct: false },
      ],
    },
    {
      prompt: "เมื่อหน้าใดในคลังมีข้อความว่า “บันทึกภาคสนาม · รอการตรวจสอบ” หมายความว่าอย่างไร",
      choices: [
        { text: "บันทึกจากพื้นที่จริงแล้ว แต่ยังไม่ได้อ่านทวนร่วมกับช่างและชุมชน", correct: true },
        { text: "เป็นข้อมูลสมมติที่สร้างขึ้นเพื่อทดสอบระบบ", correct: false },
        { text: "ช่างยืนยันความถูกต้องเรียบร้อยแล้ว", correct: false },
      ],
    },
    {
      prompt: "ภาพถ่ายที่นำเข้าคลังนี้จะถูกลบข้อมูลใดออกเสมอ",
      choices: [
        { text: "ข้อมูล EXIF รวมถึงพิกัด GPS", correct: true },
        { text: "ชื่อผู้ถ่าย", correct: false },
        { text: "วันที่ถ่าย", correct: false },
      ],
    },
  ];
  for (const [index, question] of questions.entries()) {
    await prisma.question.create({
      data: {
        quizId: quiz.id, type: "MULTIPLE_CHOICE", prompt: question.prompt, position: index + 1,
        choices: { create: question.choices },
      },
    });
  }
  console.log(`แบบฝึกหัด "${quiz.title}" — ${questions.length} ข้อ`);
}

await prisma.$disconnect();
