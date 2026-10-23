import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { BackNav } from "@/components/site/back-nav";
import { CollectionStatus, PageCrumbs } from "@/components/site/page-header";
import { getMasterIndex } from "@/lib/services/collections";
import { MasterBrowser } from "./master-browser";
import "./masters-index.css";

export const metadata: Metadata = {
  title: "ช่างผู้สืบสาน",
  description: "ช่างที่ทำงานเรือพระในอำเภอปากพะยูน ซึ่งคลังได้บันทึกงานและวิธีทำไว้",
};

export default async function MastersPage() {
  await connection();
  const { items, showingDemo, pending } = await getMasterIndex();
  return <main id="main-content" className="masters-index" tabIndex={-1}>
    <header className="masters-hero">
      <Image src="/photos/masters-banner.webp" alt="" fill priority sizes="100vw" />
      <div className="shell masters-hero-copy"><p className="masters-eyebrow">✦　ช่างผู้สืบสาน</p><h1>ช่างผู้<span>สืบสาน</span></h1><div className="masters-gold-rule" aria-hidden="true" /><p>ช่างที่คลังได้บันทึกงานและวิธีทำไว้ ประวัติและบทสัมภาษณ์ของช่างแต่ละท่านจะเพิ่มขึ้นเมื่อได้รับอนุญาต</p></div>
    </header>
    <div className="shell masters-intro"><PageCrumbs label="ช่างผู้สืบสาน" /><p>รู้จักผู้สืบสานงานเรือพระปากพะยูน ผ่านประวัติ ผลงาน และเรื่องเล่าที่บันทึกไว้<br />ผู้รักษาภูมิปัญญาท้องถิ่น และถ่ายทอดองค์ความรู้จากรุ่นสู่รุ่น</p></div>
    <MasterBrowser items={items}><CollectionStatus pending={pending} total={items.length} showingDemo={showingDemo} /></MasterBrowser>
    <div className="shell"><BackNav destinations={[{href:"/",label:"กลับหน้าแรก"},{href:"/craft",label:"จากกระดาษสู่เรือพระ"},{href:"/about",label:"เกี่ยวกับโครงการ"}]} /></div>
  </main>;
}
