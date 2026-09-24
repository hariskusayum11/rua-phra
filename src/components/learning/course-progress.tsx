"use client";

import { lessonKey, useLessonProgress } from "@/lib/learning/progress";

/** How far this device has got through a course. */
export function CourseProgress({ courseSlug, lessonSlugs }: { courseSlug: string; lessonSlugs: string[] }) {
  const { completed } = useLessonProgress();
  if (lessonSlugs.length === 0) return null;

  const done = lessonSlugs.filter((slug) => completed.has(lessonKey(courseSlug, slug))).length;
  const percent = Math.round((done / lessonSlugs.length) * 100);

  return (
    <div className="course-progress">
      <div
        className="course-progress-bar"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={lessonSlugs.length}
        aria-label={`เรียนไปแล้ว ${done} จาก ${lessonSlugs.length} บท`}
      >
        <span style={{ inlineSize: `${percent}%` }} />
      </div>
      <p>เรียนไปแล้ว {done} จาก {lessonSlugs.length} บท · นับจากเครื่องนี้</p>
    </div>
  );
}
