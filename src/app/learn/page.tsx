import { connection } from "next/server";
import Image from "next/image";
import "./learn-index.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, BookOpen } from "lucide-react";
import { getCourseIndex } from "@/lib/services/learning";



export const metadata: Metadata = {
  title: "เรียนรู้",
  description: "ชุดบทเรียนงานกระดาษเรือพระ เรียนตามจังหวะของตัวเอง ไม่ต้องสมัครสมาชิก",
};

/**
 * Rendered when someone asks for it, not when the image is built.
 *
 * `connection()` stops prerendering here, which is what lets the production image be
 * built without a reachable database — a Docker build has no database, and a deploy that
 * only works when one happens to be on the same network is a deploy that fails on the
 * morning of the exhibition. The queries are small and indexed, and Postgres sits beside
 * the app, so paying for them per request is cheaper than the fragility.
 */
export default async function LearnIndexPage() {
  await connection();
  const courses = await getCourseIndex();
  const withLessons = courses.filter((course) => course._count.lessons > 0);

  return (
    <main id="main-content" className="learn-landing" tabIndex={-1}>
      <header className="learning-banner">
        <Image src="/photos/learn-header.webp" alt="" fill priority sizes="100vw" />
        <div className="shell learning-banner-copy">
        <p className="learning-eyebrow">เรียนรู้</p>
        <h1>เรียนตามจังหวะ<br /><span>ของตัวเอง</span></h1>
        <p className="lead">
          บทเรียนสร้างจากสิ่งที่บันทึกไว้ในคลังนี้ ทั้งลวดลาย ขั้นตอน และเครื่องมือจริง
          เปิดอ่านได้เลยโดยไม่ต้องสมัครสมาชิก
        </p>
        </div>
      </header>

      <section className="shell learning-create-entry" aria-labelledby="learning-create-title">
        <div><p>ห้องทดลองงานศิลป์ · เกมสร้างลาย</p><h2 id="learning-create-title">ตอกลาย อัดดอก</h2><p>เลือกและจัดวางลาย ตอกช่อง อัดกระดาษสี แล้วลองผลงานบนสินค้า ดาวน์โหลดและแชร์ได้</p></div>
        <Link href="/create">เริ่มสร้างลายของคุณ <ArrowRight aria-hidden="true" /></Link>
      </section>
      <section className="shell learning-courses" aria-label="ชุดบทเรียน">
        {withLessons.length === 0 ? (
          <p className="empty-note">ยังไม่มีชุดบทเรียนที่เผยแพร่ ระหว่างนี้เรียนรู้จากลำดับขั้นตอนได้ที่หน้ากระบวนการงานช่าง</p>
        ) : (
          <ul className="learning-course-list">
            {withLessons.map((course) => (
              <li key={course.slug}>
                <Link href={`/learn/${course.slug}`}>
                  <span className="learning-book-icon" aria-hidden="true"><BookOpen /></span>
                  <div className="learning-course-copy"><h2>{course.title}</h2><p>{course.description}</p><span className="learning-course-count">{course._count.lessons} บทเรียน{course.isDemo ? "สาธิต" : ""}</span></div>
                  <span className="learning-start"><span>{course.isDemo ? "เริ่มบทเรียนสาธิต" : "เริ่มบทเรียน"}</span><ArrowRight aria-hidden="true" /></span>
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
