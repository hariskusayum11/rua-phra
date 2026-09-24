import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCourseIndex } from "@/lib/services/learning";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "เรียนรู้",
  description: "ชุดบทเรียนงานกระดาษเรือพระ เรียนตามจังหวะของตัวเอง ไม่ต้องสมัครสมาชิก",
};

export default async function LearnIndexPage() {
  const courses = await getCourseIndex();
  const withLessons = courses.filter((course) => course._count.lessons > 0);

  return (
    <main id="main-content" className="learn-index" tabIndex={-1}>
      <header className="shell learn-lede">
        <p className="section-index">เรียนรู้</p>
        <h1>เรียนตามจังหวะ<br />ของตัวเอง</h1>
        <p className="lead">
          บทเรียนสร้างจากสิ่งที่บันทึกไว้ในคลังนี้ ทั้งลวดลาย ขั้นตอน และเครื่องมือจริง
          เปิดอ่านได้เลยโดยไม่ต้องสมัครสมาชิก
        </p>
      </header>

      <section className="shell learn-list-wrap" aria-label="ชุดบทเรียน">
        {withLessons.length === 0 ? (
          <p className="empty-note">ยังไม่มีชุดบทเรียนที่เผยแพร่ ระหว่างนี้เรียนรู้จากลำดับขั้นตอนได้ที่หน้ากระบวนการงานช่าง</p>
        ) : (
          <ul className="learn-course-list">
            {withLessons.map((course) => (
              <li key={course.slug}>
                <Link href={`/learn/${course.slug}`}>
                  <span className="learn-course-title">{course.title}</span>
                  <small>{course.description}</small>
                  <span className="learn-course-count">{course._count.lessons} บทเรียน</span>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
                {course.isDemo && <p className="demo-notice">ข้อมูลสาธิต · สร้างขึ้นเพื่อทดสอบระบบ ยังไม่ใช่บทเรียนจริง</p>}
              </li>
            ))}
          </ul>
        )}

        <p className="upcoming-link">
          <Link className="editorial-link" href="/craft">
            ดูลำดับขั้นตอนงานช่างทั้งหมด
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </p>
      </section>
    </main>
  );
}
