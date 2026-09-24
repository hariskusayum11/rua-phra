"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { blockKindLabels, blockKinds, type BlockKind } from "@/lib/learning/blocks";
import type { AdminOption } from "@/lib/services/admin";

/**
 * The lesson editors.
 *
 * Both write their work into a hidden JSON field rather than into numbered inputs, because
 * blocks and questions get inserted, deleted and moved — `contents[3].body` stops meaning
 * anything the moment block two is removed. The form still submits as one plain action.
 */

type Draft = { kind: BlockKind; body: Record<string, unknown> };

const emptyBody: Record<BlockKind, Record<string, unknown>> = {
  text: { text: "" },
  image: { mediaId: "", caption: "" },
  step: { stepSlug: "", note: "" },
  activity: { title: "", body: "", materials: [] },
};

function readDrafts(raw: string): Draft[] {
  if (!raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const row = item as { kind?: unknown; body?: unknown };
      if (typeof row.kind !== "string" || !blockKinds.includes(row.kind as BlockKind)) return [];
      return [{ kind: row.kind as BlockKind, body: (row.body ?? {}) as Record<string, unknown> }];
    });
  } catch {
    return [];
  }
}

export function BlocksField({
  value, onChange, label, help, error, mediaOptions, stepOptions,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  help?: string;
  error?: string;
  mediaOptions: AdminOption[];
  stepOptions: AdminOption[];
}) {
  const blocks = useMemo(() => readDrafts(value), [value]);
  const [adding, setAdding] = useState<BlockKind>("text");

  function commit(next: Draft[]) {
    onChange(JSON.stringify(next));
  }
  function update(index: number, body: Record<string, unknown>) {
    commit(blocks.map((block, i) => (i === index ? { ...block, body } : block)));
  }
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  return (
    <fieldset className="lesson-editor admin-field-wide">
      <legend>{label} · {blocks.length} ส่วน</legend>
      {help && <p>{help}</p>}

      {blocks.length === 0 ? (
        <p className="lesson-editor-empty">ยังไม่มีเนื้อหา เพิ่มส่วนแรกได้จากด้านล่าง</p>
      ) : (
        <ol className="lesson-editor-list">
          {blocks.map((block, index) => (
            <li key={index} className="lesson-editor-block">
              <header>
                <strong>{index + 1}. {blockKindLabels[block.kind]}</strong>
                <div>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`ย้ายส่วนที่ ${index + 1} ขึ้น`}><ArrowUp aria-hidden="true" /></button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label={`ย้ายส่วนที่ ${index + 1} ลง`}><ArrowDown aria-hidden="true" /></button>
                  <button type="button" onClick={() => commit(blocks.filter((_, i) => i !== index))} aria-label={`ลบส่วนที่ ${index + 1}`}><Trash2 aria-hidden="true" /></button>
                </div>
              </header>

              {block.kind === "text" && (
                <label className="admin-field">
                  <span>ข้อความ</span>
                  <textarea rows={6} value={String(block.body.text ?? "")} onChange={(event) => update(index, { text: event.target.value })} />
                  <small>เว้นบรรทัดว่างหนึ่งบรรทัดเพื่อขึ้นย่อหน้าใหม่</small>
                </label>
              )}

              {block.kind === "image" && (
                <>
                  <label className="admin-field">
                    <span>ภาพจากคลัง</span>
                    <select value={String(block.body.mediaId ?? "")} onChange={(event) => update(index, { ...block.body, mediaId: event.target.value })}>
                      <option value="">— เลือกภาพ —</option>
                      {mediaOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>คำบรรยายใต้ภาพ</span>
                    <input type="text" value={String(block.body.caption ?? "")} onChange={(event) => update(index, { ...block.body, caption: event.target.value })} />
                  </label>
                </>
              )}

              {block.kind === "step" && (
                <>
                  <label className="admin-field">
                    <span>ขั้นตอนงานช่าง</span>
                    <select value={String(block.body.stepSlug ?? "")} onChange={(event) => update(index, { ...block.body, stepSlug: event.target.value })}>
                      <option value="">— เลือกขั้นตอน —</option>
                      {stepOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>คำอธิบายเพิ่มเติม</span>
                    <input type="text" value={String(block.body.note ?? "")} onChange={(event) => update(index, { ...block.body, note: event.target.value })} />
                    <small>เว้นว่างไว้จะใช้คำอธิบายของขั้นตอนนั้น</small>
                  </label>
                </>
              )}

              {block.kind === "activity" && (
                <>
                  <label className="admin-field">
                    <span>ชื่อกิจกรรม</span>
                    <input type="text" value={String(block.body.title ?? "")} onChange={(event) => update(index, { ...block.body, title: event.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span>สิ่งที่ให้ทำ</span>
                    <textarea rows={4} value={String(block.body.body ?? "")} onChange={(event) => update(index, { ...block.body, body: event.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span>สิ่งที่ต้องเตรียม</span>
                    <textarea
                      rows={3}
                      value={(Array.isArray(block.body.materials) ? (block.body.materials as string[]) : []).join("\n")}
                      onChange={(event) => update(index, { ...block.body, materials: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })}
                    />
                    <small>บรรทัดละหนึ่งรายการ</small>
                  </label>
                </>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="lesson-editor-add">
        <select value={adding} onChange={(event) => setAdding(event.target.value as BlockKind)} aria-label="ชนิดเนื้อหาที่จะเพิ่ม">
          {blockKinds.map((kind) => <option key={kind} value={kind}>{blockKindLabels[kind]}</option>)}
        </select>
        <button type="button" className="admin-secondary" onClick={() => commit([...blocks, { kind: adding, body: { ...emptyBody[adding] } }])}>
          <Plus aria-hidden="true" />เพิ่มส่วน
        </button>
      </div>
      {error && <small className="field-error">{error}</small>}
    </fieldset>
  );
}

type QuizDraft = {
  title: string;
  questions: Array<{ type: "MULTIPLE_CHOICE" | "TRUE_FALSE"; prompt: string; choices: Array<{ text: string; correct: boolean }> }>;
};

function readQuiz(raw: string): QuizDraft | null {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as QuizDraft;
    if (!parsed || !Array.isArray(parsed.questions)) return null;
    return { title: parsed.title ?? "", questions: parsed.questions };
  } catch {
    return null;
  }
}

const blankQuestion = () => ({
  type: "MULTIPLE_CHOICE" as const,
  prompt: "",
  choices: [{ text: "", correct: true }, { text: "", correct: false }],
});

export function QuizField({
  value, onChange, label, help, error,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  help?: string;
  error?: string;
}) {
  const quiz = useMemo(() => readQuiz(value), [value]);

  function commit(next: QuizDraft | null) {
    onChange(next ? JSON.stringify(next) : "");
  }
  function updateQuestion(index: number, patch: Partial<QuizDraft["questions"][number]>) {
    if (!quiz) return;
    commit({ ...quiz, questions: quiz.questions.map((question, i) => (i === index ? { ...question, ...patch } : question)) });
  }

  if (!quiz) {
    return (
      <fieldset className="lesson-editor admin-field-wide">
        <legend>{label}</legend>
        {help && <p>{help}</p>}
        <button type="button" className="admin-secondary" onClick={() => commit({ title: "ทบทวนท้ายบท", questions: [blankQuestion()] })}>
          <Plus aria-hidden="true" />เพิ่มแบบฝึกหัด
        </button>
        {error && <small className="field-error">{error}</small>}
      </fieldset>
    );
  }

  return (
    <fieldset className="lesson-editor admin-field-wide">
      <legend>{label} · {quiz.questions.length} ข้อ</legend>
      <label className="admin-field">
        <span>ชื่อแบบฝึกหัด</span>
        <input type="text" value={quiz.title} onChange={(event) => commit({ ...quiz, title: event.target.value })} />
      </label>

      <ol className="lesson-editor-list">
        {quiz.questions.map((question, index) => (
          <li key={index} className="lesson-editor-block">
            <header>
              <strong>ข้อ {index + 1}</strong>
              <div>
                <button type="button" onClick={() => commit({ ...quiz, questions: quiz.questions.filter((_, i) => i !== index) })} aria-label={`ลบข้อ ${index + 1}`}>
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </header>
            <label className="admin-field">
              <span>คำถาม</span>
              <textarea rows={2} value={question.prompt} onChange={(event) => updateQuestion(index, { prompt: event.target.value })} />
            </label>

            <div className="lesson-editor-choices">
              <p>ตัวเลือก · ติ๊กวงกลมหน้าข้อที่ถูก</p>
              {question.choices.map((choice, choiceIndex) => (
                <div key={choiceIndex} className="lesson-editor-choice">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={choice.correct}
                    onChange={() => updateQuestion(index, { choices: question.choices.map((item, i) => ({ ...item, correct: i === choiceIndex })) })}
                    aria-label={`ตัวเลือกที่ ${choiceIndex + 1} เป็นคำตอบที่ถูก`}
                  />
                  <input
                    type="text"
                    value={choice.text}
                    onChange={(event) => updateQuestion(index, { choices: question.choices.map((item, i) => (i === choiceIndex ? { ...item, text: event.target.value } : item)) })}
                    aria-label={`ข้อความตัวเลือกที่ ${choiceIndex + 1}`}
                  />
                  <button
                    type="button"
                    disabled={question.choices.length <= 2}
                    onClick={() => updateQuestion(index, { choices: question.choices.filter((_, i) => i !== choiceIndex) })}
                    aria-label={`ลบตัวเลือกที่ ${choiceIndex + 1}`}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-secondary"
                disabled={question.choices.length >= 6}
                onClick={() => updateQuestion(index, { choices: [...question.choices, { text: "", correct: false }] })}
              >
                <Plus aria-hidden="true" />เพิ่มตัวเลือก
              </button>
            </div>
          </li>
        ))}
      </ol>

      <div className="lesson-editor-add">
        <button type="button" className="admin-secondary" onClick={() => commit({ ...quiz, questions: [...quiz.questions, blankQuestion()] })}>
          <Plus aria-hidden="true" />เพิ่มคำถาม
        </button>
        <button type="button" className="admin-danger" onClick={() => commit(null)}>
          <Trash2 aria-hidden="true" />ลบแบบฝึกหัดทั้งชุด
        </button>
      </div>
      {error && <small className="field-error">{error}</small>}
    </fieldset>
  );
}
