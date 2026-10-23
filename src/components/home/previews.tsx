import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { projectTitle } from "@/lib/site-info";
import type { HomeContent } from "@/lib/services/home";

export function CraftPreview({ process }: { process: HomeContent["process"] }) {
  const allSteps = process?.steps ?? [];
  const steps = allSteps.length > 3 ? [allSteps[0], allSteps[Math.floor(allSteps.length / 2)], allSteps[allSteps.length - 1]] : allSteps;
  return (
    <section className="home-craft home-section" id="craft" aria-labelledby="craft-title">
      <div className="shell home-craft-inner">
        <figure className="home-craft-collage">
          <Image src="/photos/craft-collage.webp" alt="ภาพคอลลาจงานลายกระดาษ ประกอบด้วยมือช่าง ลายไทย และเส้นคลื่น" width={1122} height={1402} sizes="(max-width: 767px) 100vw, 48vw" />
          <figcaption>ภาพประกอบงานกระดาษเรือพระ</figcaption>
        </figure>
        <div className="home-preview-copy">
          <p className="section-index">ภูมิปัญญา · งานกระดาษ</p>
          <h2 id="craft-title">จากกระดาษ<br />สู่เรือพระ</h2>
          <p>เอกลักษณ์เรือพระปากพะยูนคือการใช้ลวดลายฉลุและอัดกนกด้วยกระดาษ สำรวจภาพและลำดับงานจากช่างในแต่ละขั้นตอน</p>
          {steps.length > 0 ? <ol className="home-step-preview">{steps.map(step => (
            <li key={step.slug}><Link href={`/craft/${step.slug}`}><span>{String(step.position).padStart(2, "0")}</span>{step.title}<ArrowUpRight aria-hidden="true" /></Link></li>
          ))}</ol> : <p className="caption">ลำดับขั้นตอนอยู่ระหว่างจัดเตรียม</p>}
          <p className="caption">{process?.isDemo ? "ข้อมูลสาธิต · ใช้ทดลองการแสดงผล" : "ดูสถานะการตรวจสอบและข้อมูลประกอบในรายละเอียดแต่ละขั้นตอน"}</p>
          <Link className="editorial-link" href="/craft">ดูขั้นตอนทั้งหมด{allSteps.length > 0 ? ` ${allSteps.length} ขั้นตอน` : ""}<ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

export { PatternPreview } from "./pattern-book";

export function ProjectPreview() {
  return (
    <section className="home-project home-section" aria-labelledby="project-title">
      <div className="shell home-project-inner">
        <div className="home-section-head"><p className="section-index">เกี่ยวกับโครงการ</p><h2 id="project-title">คลังที่เปิดให้กลับมา<br />อ่านและตรวจทาน</h2></div>
        <div className="home-preview-copy"><p>{projectTitle} รวบรวมภาพ ลวดลาย และขั้นตอนงานช่างไว้ให้ค้นต่อได้ แต่ละหน้าระบุสถานะของเนื้อหา เพื่อให้เห็นว่าส่วนใดยังรอการตรวจสอบ</p><Link className="editorial-link" href="/about">อ่านที่มาและวิธีบันทึกข้อมูล<ArrowUpRight aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
