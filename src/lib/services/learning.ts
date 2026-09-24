import "server-only";
import { getDb } from "@/lib/db";
import { parseBlock, type ParsedBlock } from "@/lib/learning/blocks";

const imageSelect = { id: true, url: true, alt: true, width: true, height: true, credit: true, focalX: true, focalY: true } as const;

/** Every course that has lessons, real ones ahead of fixtures. */
export async function getCourseIndex() {
  return getDb().course.findMany({
    orderBy: [{ isDemo: "asc" }, { createdAt: "asc" }],
    select: {
      slug: true, title: true, description: true, isDemo: true,
      _count: { select: { lessons: true } },
    },
  });
}

export async function getCourseDetail(slug: string) {
  return getDb().course.findUnique({
    where: { slug },
    select: {
      slug: true, title: true, description: true, isDemo: true,
      lessons: {
        orderBy: { position: "asc" },
        select: {
          slug: true, title: true, position: true,
          verification: { select: { status: true } },
          _count: { select: { contents: true, quizzes: true } },
        },
      },
    },
  });
}

export type CourseDetail = NonNullable<Awaited<ReturnType<typeof getCourseDetail>>>;

/**
 * One lesson, ready to render.
 *
 * Correct answers are deliberately absent from everything this returns. A quiz whose answer
 * key ships inside the page is not a quiz — it is a list with the answers written on it,
 * one "view source" away. Grading happens on the server, in `gradeQuiz`.
 */
export async function getLessonDetail(courseSlug: string, lessonSlug: string) {
  const db = getDb();
  const lesson = await db.lesson.findFirst({
    where: { slug: lessonSlug, course: { slug: courseSlug } },
    select: {
      id: true, slug: true, title: true, position: true,
      course: { select: { slug: true, title: true, isDemo: true } },
      verification: { select: { status: true } },
      contents: { orderBy: { position: "asc" }, select: { id: true, kind: true, body: true } },
      quizzes: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true, title: true,
          questions: {
            orderBy: { position: "asc" },
            select: {
              id: true, prompt: true, type: true, position: true,
              choices: { orderBy: { createdAt: "asc" }, select: { id: true, text: true } },
            },
          },
        },
      },
    },
  });
  if (!lesson) return null;

  const blocks = lesson.contents
    .map((row) => parseBlock(row))
    .filter((block): block is ParsedBlock => block !== null);

  // Image blocks name a media id; resolve them all in one query rather than per block.
  const mediaIds = blocks.flatMap((block) => (block.kind === "image" ? [block.body.mediaId] : []));
  const media = mediaIds.length
    ? await db.media.findMany({ where: { id: { in: mediaIds } }, select: imageSelect })
    : [];
  const mediaById = new Map(media.map((item) => [item.id, item]));

  const steps = blocks.flatMap((block) => (block.kind === "step" ? [block.body.stepSlug] : []));
  const stepRows = steps.length
    ? await db.processStep.findMany({ where: { slug: { in: steps } }, select: { slug: true, title: true, position: true, description: true } })
    : [];
  const stepBySlug = new Map(stepRows.map((step) => [step.slug, step]));

  const siblings = await db.lesson.findMany({
    where: { course: { slug: courseSlug } },
    orderBy: { position: "asc" },
    select: { slug: true, title: true, position: true },
  });
  const index = siblings.findIndex((item) => item.slug === lesson.slug);

  return {
    ...lesson,
    blocks,
    mediaById,
    stepBySlug,
    siblings,
    previous: index > 0 ? siblings[index - 1] : null,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
  };
}

export type LessonDetail = NonNullable<Awaited<ReturnType<typeof getLessonDetail>>>;

export type GradedQuestion = {
  questionId: string;
  correct: boolean;
  correctChoiceIds: string[];
};

/**
 * Marks a submitted quiz against the stored answer key.
 *
 * Runs on the server so the key never reaches the browser before the learner has answered.
 * Nothing is written down: there are no learner accounts yet, and recording attempts against
 * a person requires asking that person first.
 */
export async function gradeQuiz(quizId: string, answers: Record<string, string[]>) {
  const quiz = await getDb().quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      questions: {
        orderBy: { position: "asc" },
        select: { id: true, choices: { select: { id: true, correct: true } } },
      },
    },
  });
  if (!quiz) return null;

  const results: GradedQuestion[] = quiz.questions.map((question) => {
    const correctChoiceIds = question.choices.filter((choice) => choice.correct).map((choice) => choice.id);
    const given = new Set(answers[question.id] ?? []);
    // A question with no key marked cannot be got right, and must not be scored as if it were.
    const correct =
      correctChoiceIds.length > 0 &&
      given.size === correctChoiceIds.length &&
      correctChoiceIds.every((id) => given.has(id));
    return { questionId: question.id, correct, correctChoiceIds };
  });

  const scored = results.filter((result) => result.correctChoiceIds.length > 0);
  return {
    results,
    correctCount: results.filter((result) => result.correct).length,
    total: scored.length,
  };
}
