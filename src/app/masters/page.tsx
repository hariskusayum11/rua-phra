import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { MediaFrame } from "@/components/media/media-frame";
import { BackNav } from "@/components/site/back-nav";
import { CollectionStatus, PageHeader } from "@/components/site/page-header";
import { getMasterIndex } from "@/lib/services/collections";

export const metadata: Metadata = {
  title: "ช่างผู้สืบสาน",
  description: "ช่างที่ทำงานเรือพระในอำเภอปากพะยูน ซึ่งคลังได้บันทึกงานและวิธีทำไว้",
};

/**
 * The people the archive has recorded.
 *
 * One artisan at the time of writing. The page says so plainly rather than padding the
 * list: more people will be recorded, and an honest short list is better than a long one
 * made of fixtures.
 */
export default async function MastersPage() {
  await connection();
  const { items, showingDemo, pending } = await getMasterIndex();

  return (
    <main id="main-content" className="collection-page" tabIndex={-1}>
      <PageHeader
        label="ช่างผู้สืบสาน"
        lead="ช่างที่คลังได้บันทึกงานและวิธีทำไว้ ประวัติและบทสัมภาษณ์ของช่างแต่ละท่านจะเพิ่มขึ้นเมื่อได้รับอนุญาต"
      >
        <CollectionStatus pending={pending} total={items.length} showingDemo={showingDemo} />
      </PageHeader>

      <section className="shell" aria-label={`ช่าง ${items.length} ท่าน`}>
        {items.length === 0 ? (
          <p className="empty-note">ยังไม่มีช่างที่บันทึกไว้ในคลัง</p>
        ) : (
          <ul className="archive-card-list collection-grid collection-grid-people">
            {items.map((master) => (
              <li key={master.slug}>
                <Link href={`/masters/${master.slug}`}>
                  <MediaFrame
                    image={master.portraitMedia}
                    ratio="4/5"
                    sizes="(max-width: 47.99rem) 100vw, 22rem"
                    emptyLabel="ยังไม่มีภาพที่ได้รับอนุญาตให้เผยแพร่"
                  />
                  <span className="archive-card-title">{master.name}</span>
                  {master.expertise.length > 0 && (
                    <span className="archive-card-meta">{master.expertise.map((item) => item.title).join(" · ")}</span>
                  )}
                  <span className="archive-card-note collection-excerpt">{master.biography}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="shell">
        <BackNav
          destinations={[
            { href: "/", label: "กลับหน้าแรก" },
            { href: "/craft", label: "จากกระดาษสู่เรือพระ" },
            { href: "/about", label: "เกี่ยวกับโครงการ" },
          ]}
        />
      </div>
    </main>
  );
}
