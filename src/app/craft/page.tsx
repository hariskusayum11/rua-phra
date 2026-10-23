import { connection } from "next/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BackNav } from "@/components/site/back-nav";
import { getKnowledgeProcesses } from "@/lib/services/craft";
import "./craft-index.css";

export const metadata: Metadata = {
 title: "จากกระดาษ...สู่เรือพระ",
 description: "สำรวจกระบวนการสร้างงานประดับกระดาษบนเรือพระผ่านภาพและลำดับงานที่บันทึกไว้",
};
export default async function CraftPage() {
 await connection();
 const processes = await getKnowledgeProcesses();
 return <main id="main-content" className="craft-journey" tabIndex={-1}>
  <header className="craft-banner">
   <Image src="/photos/craft-header.webp" alt="" fill priority sizes="100vw" />
   <div className="shell craft-banner-copy"><p className="craft-kicker">เรียนรู้ <span aria-hidden="true" /></p><h1>จากกระดาษ<br />สู่<span>เรือพระ</span></h1><p>เรียนรู้งานลวดลายฉลุและอัดกนกด้วยกระดาษ<br />เอกลักษณ์ของเรือพระปากพะยูน<br />ผ่านภาพและลำดับงานที่บันทึกจากช่าง</p></div>
  </header>
  <div className="craft-chapters shell">
  {processes.length === 0 ? <p role="status">ยังไม่มีกระบวนการที่เผยแพร่</p> : processes.map(process => <section key={process.id} aria-labelledby={`process-${process.id}`}>
   <div className="craft-process-caption"><h2 id={`process-${process.id}`}>{process.title}</h2>{(process.isDemo || !["VERIFIED","PUBLISHED"].includes(process.verification?.status ?? "")) && <p>{process.isDemo ? "ข้อมูลสาธิต · ลำดับและรายละเอียดรอการตรวจสอบภาคสนาม" : "บันทึกภาคสนาม · รอการตรวจสอบร่วมกับช่างและชุมชน"}</p>}</div>
   <ol className="craft-chapter-list">{process.steps.map(step => <li key={step.slug}>
    <Link className="craft-chapter" href={`/craft/${step.slug}`}>
     <div className="craft-chapter-photo">{step.coverMedia?.url ? <Image src={step.coverMedia.url} alt={step.coverMedia.alt} fill sizes="(max-width: 600px) 35vw, 360px" /> : <span>ภาพอยู่ระหว่างการบันทึก</span>}</div>
     <div className="craft-chapter-copy"><h3>{step.title}</h3><p>{step.description}</p>{step.isDemo && <small>ขั้นตอนสาธิต · รอการตรวจสอบภาคสนาม</small>}</div>
     <span className="craft-chapter-number" aria-hidden="true">{step.position}</span><span className="craft-chapter-arrow"><ChevronRight aria-hidden="true" /><span className="sr-only">อ่านรายละเอียดขั้นตอน</span></span>
    </Link>
   </li>)}</ol>
  </section>)}
  </div>
  <div className="shell"><BackNav destinations={[{href:"/",label:"หน้าหลัก"},{href:"/patterns",label:"คลังลวดลาย"},{href:"/learn",label:"บทเรียน"}]} /></div>
  <svg className="craft-bottom-waves" viewBox="0 0 1440 150" preserveAspectRatio="none" aria-hidden="true"><path fill="#91cce0" d="M0 25Q180 0 360 80T720 80T1080 65T1440 20V150H0Z"/><path fill="#398dbb" d="M0 45Q180 20 360 100T720 100T1080 85T1440 40V150H0Z"/><path fill="#145c89" d="M0 75Q180 40 360 120T720 120T1080 105T1440 65V150H0Z"/><path fill="none" stroke="#eac675" strokeWidth="3" d="M0 42Q180 17 360 97T720 97T1080 82T1440 37M0 72Q180 37 360 117T720 117T1080 102T1440 62"/></svg>
 </main>;
}
