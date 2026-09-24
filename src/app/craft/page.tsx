import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getKnowledgeProcesses } from "@/lib/services/craft";

export const metadata: Metadata = {
  title: "จากกระดาษ...สู่เรือพระ",
  description: "สำรวจกระบวนการสร้างงานประดับกระดาษบนเรือพระผ่านลำดับองค์ความรู้ที่แก้ไขและตรวจสอบได้",
};

export default async function CraftPage() {
  const processes = await getKnowledgeProcesses();

  return (
    <main id="main-content" className="craft-page" tabIndex={-1}>
      <header className="craft-hero">
        <p className="eyebrow">คลังภูมิปัญญางานกระดาษ</p>
        <h1>จากกระดาษ<br /><span>สู่เรือพระ</span></h1>
        <p>ติดตามร่องรอยของวัสดุ เส้น และฝีมือ ผ่านแต่ละช่วงของการสร้างงานประดับบนเรือพระ</p>
      </header>

      {processes.length === 0 ? (
        <section className="craft-empty" role="status">
          <h2>ยังไม่มีกระบวนการที่เผยแพร่</h2>
          <p>องค์ความรู้จะปรากฏที่นี่เมื่อได้รับการบันทึกลงในคลังข้อมูล</p>
        </section>
      ) : processes.map((process) => (
        <section className="process-story" key={process.id} aria-labelledby={`process-${process.id}`}>
          <div className="process-intro">
            <div className="process-sticky">
              <p className="eyebrow">กระบวนการเรียนรู้</p>
              <h2 id={`process-${process.id}`}>{process.title}</h2>
              <p>{process.description}</p>
              {/* Anything not yet verified says so, whether it is a fixture or a real
                  field record. Silence would read as confirmation. */}
              {process.verification?.status !== "VERIFIED" && process.verification?.status !== "PUBLISHED" && (
                <p className="demo-notice">
                  {process.isDemo
                    ? "ข้อมูลสาธิต · ลำดับและรายละเอียดรอการตรวจสอบภาคสนาม"
                    : "บันทึกภาคสนาม · รอการตรวจสอบร่วมกับช่างและชุมชน"}
                </p>
              )}
            </div>
          </div>

          <ol className="process-timeline">
            {process.steps.map((step) => (
              <li key={step.slug}>
                <div className="timeline-marker" aria-hidden="true">{String(step.position).padStart(2, "0")}</div>
                <article className="timeline-entry">
                  {step.coverMedia?.url && (
                    <div className="timeline-image">
                      <Image src={step.coverMedia.url} alt={step.coverMedia.alt} fill sizes="(max-width: 760px) 100vw, 45vw" />
                    </div>
                  )}
                  <div className="timeline-copy">
                    <p className="step-number">ขั้นที่ {String(step.position).padStart(2, "0")}</p>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <dl className="step-glance">
                      <div><dt>วัสดุ</dt><dd>{step.materials.map(({ material }) => material.name).join(" · ") || "รอบันทึก"}</dd></div>
                      <div><dt>เครื่องมือ</dt><dd>{step.tools.map(({ tool }) => tool.name).join(" · ") || "รอบันทึก"}</dd></div>
                    </dl>
                    <Link className="editorial-link" href={`/craft/${step.slug}`}>
                      อ่านรายละเอียดขั้นตอน <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
