import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { VerificationNote } from "@/components/archive/verification-note";
import { LessonComplete } from "@/components/learning/lesson-complete";
import { LessonQuiz } from "@/components/learning/lesson-quiz";
import { paragraphs } from "@/lib/learning/blocks";
import { getLessonDetail } from "@/lib/services/learning";

type Props = { params: Promise<{ courseSlug: string; lessonSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const lesson = await getLessonDetail(courseSlug, lessonSlug);
  if (!lesson) return { title: "ไม่พบบทเรียน" };
  return { title: `${lesson.title} · ${lesson.course.title}` };
}

export default async function LessonPage({ params }: Props) {
  const { courseSlug, lessonSlug } = await params;
  const lesson = await getLessonDetail(courseSlug, lessonSlug);
  if (!lesson) notFound();

  const quizzes = lesson.quizzes.filter((quiz) => quiz.questions.length > 0);

  return (
    <main id="main-content" className="lesson-page" tabIndex={-1}>
      <article className="shell lesson-head">
        <p className="section-index">
          <Link href={`/learn/${lesson.course.slug}`}>{lesson.course.title}</Link>
          {" · "}บทที่ {lesson.position}
        </p>
        <h1>{lesson.title}</h1>
        <VerificationNote status={lesson.verification?.status} isDemo={lesson.course.isDemo} />
      </article>

      <div className="shell lesson-body">
        {lesson.blocks.length === 0 ? (
          <p className="empty-note">
            บทเรียนนี้ยังไม่ได้ใส่เนื้อหา ผู้ดูแลสามารถเพิ่มได้จากระบบจัดการองค์ความรู้
          </p>
        ) : (
          lesson.blocks.map((block) => {
            if (block.kind === "text") {
              return (
                <div key={block.id} className="lesson-text">
                  {paragraphs(block.body.text).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              );
            }

            if (block.kind === "image") {
              const media = lesson.mediaById.get(block.body.mediaId);
              return (
                <figure key={block.id} className="lesson-figure">
                  <MediaFrame image={media ?? null} ratio="3/2" sizes="(max-width: 47.99rem) 100vw, 44rem" emptyLabel="ไม่พบภาพที่อ้างถึง" />
                  {(block.body.caption || media?.credit) && (
                    <figcaption className="caption">
                      {block.body.caption}
                      {block.body.caption && media?.credit ? " · " : ""}
                      {media?.credit}
                    </figcaption>
                  )}
                </figure>
              );
            }

            if (block.kind === "step") {
              const step = lesson.stepBySlug.get(block.body.stepSlug);
              if (!step) return null;
              return (
                <div key={block.id} className="lesson-step-link">
                  <p className="lesson-step-kicker">ดูขั้นตอนจริงในคลัง</p>
                  <Link className="lesson-step-title" href={`/craft/${step.slug}`}>
                    {String(step.position).padStart(2, "0")} {step.title}
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                  <p>{block.body.note ?? step.description}</p>
                </div>
              );
            }

            return (
              <div key={block.id} className="lesson-activity">
                <p className="lesson-activity-kicker">ลงมือทำ</p>
                <h2>{block.body.title}</h2>
                <p>{block.body.body}</p>
                {block.body.materials.length > 0 && (
                  <>
                    <p className="lesson-activity-label">สิ่งที่ต้องเตรียม</p>
                    <ul>
                      {block.body.materials.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })
        )}

        {quizzes.map((quiz) => (
          <LessonQuiz key={quiz.id} quiz={quiz} />
        ))}

        <LessonComplete courseSlug={lesson.course.slug} lessonSlug={lesson.slug} />
      </div>

      <nav className="shell lesson-nav" aria-label="บทเรียนก่อนหน้าและถัดไป">
        {lesson.previous ? (
          <Link className="lesson-nav-link" href={`/learn/${lesson.course.slug}/${lesson.previous.slug}`} rel="prev">
            <ArrowLeft aria-hidden="true" />
            <span>
              <small>บทก่อนหน้า</small>
              {lesson.previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {lesson.next ? (
          <Link className="lesson-nav-link" data-next="true" href={`/learn/${lesson.course.slug}/${lesson.next.slug}`} rel="next">
            <span>
              <small>บทถัดไป</small>
              {lesson.next.title}
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <Link className="lesson-nav-link" data-next="true" href={`/learn/${lesson.course.slug}`}>
            <span>
              <small>จบชุดบทเรียน</small>
              กลับไปหน้ารวมบท
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        )}
      </nav>
    </main>
  );
}
