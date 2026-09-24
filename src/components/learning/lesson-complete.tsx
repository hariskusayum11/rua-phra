"use client";

import { Check } from "lucide-react";
import { lessonKey, useLessonProgress } from "@/lib/learning/progress";

/** Marks a lesson finished on this device. */
export function LessonComplete({ courseSlug, lessonSlug }: { courseSlug: string; lessonSlug: string }) {
  const key = lessonKey(courseSlug, lessonSlug);
  const { completed, toggle } = useLessonProgress();
  const done = completed.has(key);

  return (
    <div className="lesson-complete">
      <button type="button" className="lesson-complete-button" onClick={() => toggle(key)} aria-pressed={done}>
        <span className="lesson-complete-box" aria-hidden="true">{done && <Check />}</span>
        {done ? "เรียนบทนี้แล้ว" : "ทำเครื่องหมายว่าเรียนแล้ว"}
      </button>
      <p className="lesson-complete-note">จำไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น ไม่ได้ส่งไปเก็บที่ไหน</p>
    </div>
  );
}
