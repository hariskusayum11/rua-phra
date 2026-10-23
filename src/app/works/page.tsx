import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./works-index.css";
import { connection } from "next/server";
import { ArrowRight, Palette } from "lucide-react";
import { BackNav } from "@/components/site/back-nav";
import { PageCrumbs } from "@/components/site/page-header";
import { getWorkIndex } from "@/lib/services/collections";

export const metadata: Metadata = {
  title: "ผลงานคนรุ่นใหม่",
  description: "ผลงานที่ผู้เรียนออกแบบจากลวดลายเรือพระปากพะยูน",
};

/**
 * Work by learners, once there is some.
 *
 * Nothing is published yet, and the page says that rather than showing the four fixture
 * pieces in the database: a gallery of invented student work would present the project's
 * targets as though they had already been met.
 */
export default async function WorksPage() {
  await connection();
  const works = await getWorkIndex();

  return (
    <main id="main-content" className="works-index" tabIndex={-1}>
      <header className="works-hero">
        <Image src="/photos/works-banner.webp" alt="" fill priority sizes="100vw" />
        <div className="shell works-hero-copy">
          <p className="works-eyebrow">✦　ต่อยอดภูมิปัญญา สู่ความคิดสร้างสรรค์</p>
          <h1>ผลงาน<span>คนรุ่นใหม่</span></h1>
          <div className="works-gold-rule" aria-hidden="true" />
          <p>จากแรงบันดาลใจในลวดลายเรือพระปากพะยูน<br />สู่ผลงานสร้างสรรค์ที่เล่าเรื่องในมุมมองใหม่</p>
        </div>
        <small className="works-illustration-label">ภาพประกอบแนวคิดการต่อยอดลวดลาย</small>
      </header>
      <div className="shell works-intro"><PageCrumbs label="ผลงานคนรุ่นใหม่" /><div><h2>จากลวดลาย สู่แรงบันดาลใจ</h2><p>ผลงานที่ผู้เรียนออกแบบโดยตีความจากลวดลายเรือพระ แต่ละชิ้นบอกว่าได้แรงบันดาลใจจากลายใด</p></div></div>

      <section className="shell works-library" aria-label="ผลงาน">
        {works.length === 0 ? (
          <div className="works-empty">
            <span className="works-empty-icon"><Palette aria-hidden="true" /></span>
            <h2>ยังไม่มีผลงานที่เผยแพร่</h2>
            <p>
              ผลงานของผู้เรียนจะแสดงที่นี่เมื่อผ่านกิจกรรมการเรียนรู้และได้รับความยินยอมให้เผยแพร่แล้ว
              ระหว่างนี้เริ่มจากบทเรียนได้ ซึ่งพาไปตั้งแต่รู้จักลายจนถึงออกแบบงานของตัวเอง
            </p>
            <Link className="button-solid" href="/learn">
              ไปที่บทเรียน
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <ul className="works-cards">
            {works.map((work) => (
              <li key={work.slug}>
                <article className="collection-work">
                  {work.media[0]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element -- learner uploads are already sized by the upload step
                    <img src={work.media[0].url} alt={work.media[0].alt} loading="lazy" />
                  )}
                  <h2 className="archive-card-title">{work.title}</h2>
                  <p className="archive-card-meta">
                    {work.user.name}
                    {work.pattern ? ` · จาก${work.pattern.localName || work.pattern.name}` : ""}
                  </p>
                  <p className="archive-card-note">{work.concept}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="shell">
        <BackNav
          destinations={[
            { href: "/", label: "กลับหน้าแรก" },
            { href: "/learn", label: "เรียนรู้" },
            { href: "/patterns", label: "คลังลวดลาย" },
          ]}
        />
      </div>
    </main>
  );
}
