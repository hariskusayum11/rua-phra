import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CourseProgress } from "@/components/learning/course-progress";
import { getCourseDetail } from "@/lib/services/learning";

type Props = { params: Promise<{ courseSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseDetail((await params).courseSlug);
  if (!course) return { title: "ไม่พบชุดบทเรียน" };
  return { title: course.title, description: course.description };
}

export default async function CoursePage({ params }: Props) {
  const { courseSlug } = await params;
  const course = await getCourseDetail(courseSlug);
  if (!course) notFound();

  return (
    <main id="main-content" className="learn-course" tabIndex={-1}>
      <header className="shell learn-lede">
        <p className="section-index">ชุดบทเรียน</p>
        <h1>{course.title}</h1>
        <p className="lead">{course.description}</p>
        {course.isDemo && <p className="demo-notice">ข้อมูลสาธิต · โครงบทเรียนนี้ใช้ทดสอบระบบ เนื้อหาจริงอยู่ระหว่างการจัดทำ</p>}
        <CourseProgress courseSlug={course.slug} lessonSlugs={course.lessons.map((lesson) => lesson.slug)} />
      </header>

      <section className="shell learn-lesson-list-wrap" aria-label="บทเรียนในชุดนี้">
        {course.lessons.length === 0 ? (
          <p className="empty-note">ยังไม่มีบทเรียนในชุดนี้</p>
        ) : (
          <ol className="learn-lesson-list">
            {course.lessons.map((lesson) => {
              const empty = lesson._count.contents === 0;
              return (
                <li key={lesson.slug}>
                  <Link href={`/learn/${course.slug}/${lesson.slug}`}>
                    <span className="learn-lesson-number" aria-hidden="true">{String(lesson.position).padStart(2, "0")}</span>
                    <span className="learn-lesson-title">{lesson.title}</span>
                    <small>
                      {/* An empty lesson says so on the list, so nobody opens seven of them to find out. */}
                      {empty
                        ? "ยังไม่ได้ใส่เนื้อหา"
                        : `${lesson._count.contents} ส่วน${lesson._count.quizzes > 0 ? " · มีแบบฝึกหัด" : ""}`}
                    </small>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <nav className="shell learn-back" aria-label="กลับไปยังรายการบทเรียน">
        <Link className="editorial-link" href="/learn">
          ชุดบทเรียนทั้งหมด
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </nav>
    </main>
  );
}
