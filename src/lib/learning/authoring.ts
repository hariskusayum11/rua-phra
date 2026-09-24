import { z } from "zod";
import { blockSchemas, isBlockKind } from "@/lib/learning/blocks";

/**
 * What the lesson editor posts, and how it is checked before anything is written.
 *
 * The editor sends its work as JSON in a hidden field rather than as dozens of numbered
 * inputs, because blocks get added, removed and reordered — names like `contents[3].body`
 * go stale the moment something above them is deleted.
 */
const draftBlock = z
  .object({ kind: z.string(), body: z.unknown() })
  .refine((value) => isBlockKind(value.kind), { message: "ชนิดเนื้อหาไม่ถูกต้อง" })
  .transform((value, ctx) => {
    if (!isBlockKind(value.kind)) return z.NEVER;
    const parsed = blockSchemas[value.kind].safeParse(value.body);
    if (!parsed.success) {
      ctx.addIssue({ code: "custom", message: "เนื้อหาส่วนนี้ยังกรอกไม่ครบ" });
      return z.NEVER;
    }
    return { kind: value.kind, body: parsed.data };
  });

export const lessonBlocks = z.array(draftBlock).max(60);

const draftChoice = z.object({
  text: z.string().trim().min(1, "กรอกตัวเลือกด้วย").max(400),
  correct: z.boolean().default(false),
});

const draftQuestion = z
  .object({
    type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE"]),
    prompt: z.string().trim().min(1, "กรอกคำถามด้วย").max(1000),
    choices: z.array(draftChoice).min(2, "ต้องมีอย่างน้อย 2 ตัวเลือก").max(6),
  })
  // Grading matches the answer set exactly, so a question with no key marked — or with two —
  // could never be answered correctly. Better to refuse it here than to ship it unanswerable.
  .refine((value) => value.choices.filter((choice) => choice.correct).length === 1, {
    message: "เลือกคำตอบที่ถูกไว้หนึ่งข้อ",
  });

export const lessonQuiz = z
  .object({
    title: z.string().trim().min(1, "ตั้งชื่อแบบฝึกหัดด้วย").max(200),
    questions: z.array(draftQuestion).min(1).max(30),
  })
  .nullable();

export type LessonBlockDraft = z.infer<typeof lessonBlocks>[number];
export type LessonQuizDraft = NonNullable<z.infer<typeof lessonQuiz>>;

/** Parses a hidden JSON field, treating blank and malformed input as "nothing supplied". */
export function parseJsonField(raw: unknown): unknown {
  if (typeof raw !== "string" || raw.trim() === "") return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
