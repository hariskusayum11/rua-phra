import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clapperboard, Lightbulb } from "lucide-react";
import type { HomeContent } from "@/lib/services/home";

export function LearningPath({ course, stepCount }: { course: HomeContent["course"]; stepCount: number }) {
  return <section className="home-learning-journey home-section" id="learning" aria-labelledby="learning-title">
    <div className="learning-journey-art"><Image src="/photos/home-learning-workshop.webp" alt="ภาพประกอบประตูสู่เวิร์กช็อปเรือพระสีสันสดใส" fill sizes="100vw" /></div>
    <div className="learning-journey-copy">
      <p className="section-index">✦ <span>เส้นทางการเรียนรู้</span></p>
      <h2 id="learning-title">เปิดประตูสู่<br /><span>ห้องเรียนศิลป์เรือพระ</span></h2>
      <p className="learning-journey-description">เรียนรู้ภูมิปัญญาลวดลายฉลุและการอัดกนกด้วยกระดาษ จากงานช่างเรือพระปากพะยูน สู่แรงบันดาลใจและการต่อยอด เพื่อสืบสานคุณค่าทางวัฒนธรรม</p>
      <Link className="learning-journey-start" href="/learn">เข้าสู่บทเรียน<span><ArrowRight aria-hidden="true" /></span></Link>
      <ul className="learning-journey-features" aria-label="รูปแบบการเรียนรู้">
        <li><BookOpen aria-hidden="true" /><span>บทเรียน<br />เรียนรู้ทีละขั้นตอน</span></li>
        <li><Clapperboard aria-hidden="true" /><span>สื่อการเรียนรู้<br />เห็นภาพ เข้าใจง่าย</span></li>
        <li><Lightbulb aria-hidden="true" /><span>ลงมือทำ<br />ต่อยอดงานศิลป์</span></li>
      </ul>
      <p className="learning-journey-note">{course ? `${course.lessonCount} บทเรียน${course.isDemo ? "สาธิต · ยังไม่ใช่บทเรียนที่ผ่านการตรวจสอบ" : ""}` : `${stepCount} ขั้นตอนที่บันทึกไว้`}</p>
    </div>
  </section>;
}
