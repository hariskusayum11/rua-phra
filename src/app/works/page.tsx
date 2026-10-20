import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";
import { BackNav } from "@/components/site/back-nav";
import { PageHeader } from "@/components/site/page-header";
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
    <main id="main-content" className="collection-page" tabIndex={-1}>
      <PageHeader
        label="ผลงานคนรุ่นใหม่"
        lead="ผลงานที่ผู้เรียนออกแบบโดยตีความจากลวดลายเรือพระ แต่ละชิ้นบอกว่าได้แรงบันดาลใจจากลายใด"
      />

      <section className="shell" aria-label="ผลงาน">
        {works.length === 0 ? (
          <div className="collection-empty">
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
          <ul className="archive-card-list collection-grid">
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
