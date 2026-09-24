"use server";

import { z } from "zod";
import { gradeQuiz } from "@/lib/services/learning";

const submission = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.array(z.string().uuid()).max(10)),
});

export type QuizResult = NonNullable<Awaited<ReturnType<typeof gradeQuiz>>>;

/**
 * Marks a quiz.
 *
 * Open to anyone, like the lesson it belongs to. Someone determined can submit repeatedly
 * to work out the key, which is true of every quiz ever printed on paper — what matters is
 * that the key is not sitting in the page before the learner has answered at all.
 *
 * Nothing is recorded. Storing an attempt means storing it against a person, and this site
 * has no learner accounts and has not asked anyone for permission to keep their score.
 */
export async function submitQuizAction(input: unknown): Promise<QuizResult | { error: string }> {
  const parsed = submission.safeParse(input);
  if (!parsed.success) return { error: "คำตอบที่ส่งมาไม่ถูกต้อง ลองใหม่อีกครั้ง" };

  const result = await gradeQuiz(parsed.data.quizId, parsed.data.answers);
  if (!result) return { error: "ไม่พบแบบฝึกหัดนี้" };
  return result;
}
