import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { HomeContent } from "@/lib/services/home";

const journey = [
  "รู้จัก",
  "เข้าใจเรื่องราว",
  "รู้จักลวดลาย",
  "เรียนรู้เครื่องมือ",
  "ทดลองสร้าง",
  "สร้างผลงาน",
];

/**
 * Section 09 — the invitation, placed after the reader already knows what they would be
 * learning. It shows the shape of the journey rather than a wall of course cards.
 */
export function LearningPath({ course, stepCount }: { course: HomeContent["course"]; stepCount: number }) {
  const lessonCount = course?.lessonCount ?? 0;
  // Send the reader to the course only when there is one. Otherwise the recorded process
  // is the real learning material, and the card says so instead of promising lessons.
  const href = course ? `/learn/${course.slug}` : "/craft";

  return (
    <section className="home-learning" id="learning" aria-labelledby="learning-title">
      <div className="shell home-learning-inner">
        <div className="home-learning-copy">
          <Reveal>
            <p className="section-index">08 / เรียนรู้</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 id="learning-title">
              จากการมองเห็น
              <br />
              สู่การลงมือทำ
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <ol className="home-journey">
              {journey.map((stage, index) => (
                <li key={stage}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  {stage}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal className="home-learning-card" delay={120}>
          <p className="home-learning-card-kicker">เส้นทางการเรียนรู้</p>
          {course ? (
            <>
              <h3>{course.title}</h3>
              <p className="home-learning-card-text">{course.description}</p>
              <p className="home-learning-card-count">
                {lessonCount} บทเรียน · เรียนตามจังหวะของคุณ
              </p>
            </>
          ) : (
            <>
              <h3>ลำดับขั้นตอนงานกระดาษ</h3>
              <p className="home-learning-card-text">
                ชุดบทเรียนกำลังอยู่ระหว่างการจัดทำ ระหว่างนี้สามารถเรียนรู้จากลำดับขั้นตอนที่บันทึกไว้แล้ว
              </p>
              <p className="home-learning-card-count">{stepCount} ขั้นตอน · เรียนตามจังหวะของคุณ</p>
            </>
          )}
          <Link className="button-solid" href={href}>
            เริ่มเรียนรู้
            <ArrowRight aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
