"use client";

import { useState, useTransition } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { submitQuizAction, type QuizResult } from "@/app/learn/actions";
import type { LessonDetail } from "@/lib/services/learning";

type Quiz = LessonDetail["quizzes"][number];
type Question = Quiz["questions"][number];

/** Question types this renderer can actually present. The rest say so rather than vanishing. */
const supported = new Set(["MULTIPLE_CHOICE", "TRUE_FALSE"]);

export function LessonQuiz({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const askable = quiz.questions.filter((question) => supported.has(question.type));
  const unanswered = askable.filter((question) => !answers[question.id]);

  function submit() {
    setError(null);
    startTransition(async () => {
      const response = await submitQuizAction({
        quizId: quiz.id,
        answers: Object.fromEntries(Object.entries(answers).map(([id, choice]) => [id, [choice]])),
      });
      if ("error" in response) {
        setError(response.error);
        return;
      }
      setResult(response);
    });
  }

  function reset() {
    setAnswers({});
    setResult(null);
    setError(null);
  }

  const resultFor = (question: Question) => result?.results.find((row) => row.questionId === question.id);

  return (
    <section className="lesson-quiz" aria-labelledby={`quiz-${quiz.id}`}>
      <h2 id={`quiz-${quiz.id}`}>{quiz.title}</h2>
      <p className="lesson-quiz-note">
        ทำเพื่อทบทวนตัวเอง ไม่มีการเก็บคะแนนและไม่มีใครเห็นคำตอบของคุณ
      </p>

      <ol className="lesson-quiz-list">
        {quiz.questions.map((question, index) => {
          const graded = resultFor(question);
          if (!supported.has(question.type)) {
            return (
              <li key={question.id} className="lesson-quiz-item">
                <p className="lesson-quiz-prompt">{index + 1}. {question.prompt}</p>
                <p className="lesson-quiz-unsupported">คำถามประเภทนี้ยังแสดงผลไม่ได้ในขณะนี้</p>
              </li>
            );
          }
          return (
            <li key={question.id} className="lesson-quiz-item" data-graded={graded ? (graded.correct ? "correct" : "wrong") : undefined}>
              <fieldset>
                <legend className="lesson-quiz-prompt">{index + 1}. {question.prompt}</legend>
                <div className="lesson-quiz-choices">
                  {question.choices.map((choice) => {
                    const isAnswer = graded?.correctChoiceIds.includes(choice.id) ?? false;
                    const picked = answers[question.id] === choice.id;
                    return (
                      <label
                        key={choice.id}
                        className="lesson-quiz-choice"
                        data-state={!graded ? undefined : isAnswer ? "answer" : picked ? "picked-wrong" : undefined}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={choice.id}
                          checked={picked}
                          disabled={Boolean(result) || pending}
                          onChange={() => setAnswers((current) => ({ ...current, [question.id]: choice.id }))}
                        />
                        <span>{choice.text}</span>
                        {graded && isAnswer && <Check className="lesson-quiz-icon" aria-label="คำตอบที่ถูก" />}
                        {graded && picked && !isAnswer && <X className="lesson-quiz-icon" aria-label="คำตอบที่คุณเลือก" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>

      {error && <p className="lesson-quiz-error" role="alert">{error}</p>}

      <div className="lesson-quiz-actions">
        {result ? (
          <>
            <p className="lesson-quiz-score" role="status">
              ตอบถูก {result.correctCount} จาก {result.total} ข้อ
            </p>
            <button type="button" className="text-action" onClick={reset}>
              <RotateCcw aria-hidden="true" />
              ทำอีกครั้ง
            </button>
          </>
        ) : (
          <>
            <button type="button" className="text-action" onClick={submit} disabled={pending || askable.length === 0 || unanswered.length > 0}>
              {pending ? "กำลังตรวจ…" : "ตรวจคำตอบ"}
            </button>
            {unanswered.length > 0 && askable.length > 0 && (
              <p className="lesson-quiz-remaining" aria-live="polite">เหลืออีก {unanswered.length} ข้อ</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
