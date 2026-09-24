/**
 * Rewrites the paper-to-boat process copy to match the photographs now attached to it.
 *
 * The step titles came from the field team's own filenames and the photographs document
 * each stage, so the sequence is no longer a fixture. The descriptions here say only what
 * the photographs show. Anything interpretive — why a stage matters, what to watch out for
 * — stays marked as awaiting confirmation from the artisans, because reading a photograph
 * is not the same as being taught by the person in it.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PENDING_NOTE = "คำแนะนำเชิงเทคนิคของขั้นตอนนี้รอการบันทึกจากช่างโดยตรง";

/**
 * Steps that involve sharp tools keep a safety note. It says that the real guidance has
 * not been recorded yet rather than inventing it — but the section stays on the page,
 * because removing it entirely would read as "there is nothing to be careful about".
 */
const TOOL_WARNING =
  "ขั้นตอนนี้ใช้เครื่องมือมีคมและการออกแรงกด ข้อกำหนดด้านความปลอดภัยที่ถูกต้องรอการบันทึกจากช่าง " +
  "ระหว่างนี้ผู้เรียนควรทำภายใต้การดูแลของผู้มีประสบการณ์";

await prisma.knowledgeProcess.update({
  where: { slug: "paper-decoration-demo" },
  data: {
    title: "จากกระดาษสู่เรือพระ",
    description:
      "ลำดับการทำงานเจ็ดขั้น บันทึกภาพจากพื้นที่จริงที่อำเภอปากพะยูน " +
      "ตั้งแต่การเตรียมเครื่องมือ จนถึงการประดับลวดลายลงบนลำเรือ",
    isDemo: false,
  },
});

const steps = [
  {
    slug: "prepare-materials-demo",
    description: "จัดเหล็กตอกลายหลายขนาดและค้อนไม้ให้พร้อมบนโต๊ะทำงาน พร้อมกับแถบกระดาษที่เขียนเส้นลายไว้แล้ว",
    importance: "เครื่องมือแต่ละขนาดให้รูปช่องที่ต่างกัน การจัดเรียงไว้ล่วงหน้าจึงเป็นส่วนหนึ่งของการออกแบบลาย",
    warning: TOOL_WARNING,
  },
  {
    slug: "pattern-design-demo",
    description: "ร่างแบบด้วยดินสอบนกระดาษ กำหนดรูปทรงและสัดส่วนของลายก่อนถ่ายทอดต่อไปยังแม่แบบ",
    importance: "แบบร่างทำหน้าที่เป็นภาษากลางระหว่างผู้ออกแบบ ผู้ทำแม่แบบ และผู้ประกอบชิ้นงาน",
  },
  {
    slug: "template-making-demo",
    description: "ถ่ายลายที่ร่างไว้ลงบนกระดาษแม่แบบ วางบนแผ่นรองตัด เพื่อใช้ทำซ้ำให้ได้สัดส่วนเดิมหลายชิ้น",
    importance: "แม่แบบช่วยรักษาสัดส่วนเมื่อองค์ประกอบหนึ่งต้องเกิดซ้ำหลายครั้งตลอดลำเรือ",
  },
  {
    slug: "paper-cutting-demo",
    description: "ช่างใช้เหล็กตอกเจาะกระดาษตามเส้นลายทีละจังหวะ จนเกิดช่องโปร่งต่อเนื่องกันทั้งแผ่น",
    importance: "จังหวะของช่องว่างมีผลต่อความต่อเนื่องของลายเมื่อนำไปประกอบและมองจากระยะไกล",
    warning: TOOL_WARNING,
  },
  {
    slug: "embossing-demo",
    description: "ประกอบชิ้นดอกและกลีบสีลงบนแถบพื้น จนเกิดลายเต็มแถบพร้อมนำไปใช้",
    importance: "การวางสีตัดกันอย่างชัดเจนทำให้ลายอ่านออกได้แม้มองจากระยะไกลกลางแดด",
  },
  {
    slug: "detail-finishing-demo",
    description: "ตรวจขอบและรอยต่อของแต่ละแถบ แล้วนำไปแขวนตากให้แห้งก่อนนำไปประกอบบนเรือ",
    importance: "รายละเอียดเล็ก ๆ ของแต่ละแถบส่งผลต่อจังหวะรวมเมื่อชิ้นงานเรียงต่อกันตลอดลำ",
  },
  {
    slug: "boat-installation-demo",
    description: "ติดแถบลวดลายลงบนลำเรือ เรียงซ้อนกันเป็นชั้นตลอดแนว จนกลายเป็นผืนลายเดียวกันทั้งลำ",
    importance: "ขั้นนี้เชื่อมงานกระดาษแต่ละชิ้นเข้ากับสัดส่วนและเรื่องเล่าของเรือทั้งลำ",
  },
];

for (const step of steps) {
  await prisma.processStep.update({
    where: { slug: step.slug },
    data: {
      description: step.description,
      importance: step.importance,
      instructions: [],
      tips: PENDING_NOTE,
      warnings: step.warning ?? null,
      isDemo: false,
    },
  });
}

console.log(`Updated the process and ${steps.length} steps to field-recorded copy.`);
await prisma.$disconnect();
