import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { MediaFrame } from "@/components/media/media-frame";
import { BackNav } from "@/components/site/back-nav";
import { CollectionStatus, PageHeader } from "@/components/site/page-header";
import { patternCategoryLabel } from "@/lib/pattern-categories";
import { getPatternIndex } from "@/lib/services/collections";

export const metadata: Metadata = {
  title: "คลังลวดลาย",
  description: "ลวดลายที่บันทึกจากเรือพระปากพะยูน พร้อมลักษณะ ความหมาย และเรือที่ใช้ลายนั้น",
};

/**
 * Every recorded pattern.
 *
 * Before this page the pattern entries had no way in from the site at all — the homepage
 * cards linked to the boat instead — so each one could only be reached by its QR code.
 */
export default async function PatternsPage() {
  await connection();
  const { items, showingDemo, pending } = await getPatternIndex();

  return (
    <main id="main-content" className="collection-page" tabIndex={-1}>
      <PageHeader
        label="คลังลวดลาย"
        lead="ลวดลายที่บันทึกจากเรือพระ ดูลักษณะ ความหมายที่บันทึกได้ และเรือลำที่ใช้ลายนั้น"
      >
        <CollectionStatus pending={pending} total={items.length} showingDemo={showingDemo} />
      </PageHeader>

      <section className="shell" aria-label={`ลวดลาย ${items.length} ลาย`}>
        {items.length === 0 ? (
          <p className="empty-note">ยังไม่มีลวดลายที่บันทึกไว้ในคลัง</p>
        ) : (
          <ul className="archive-card-list collection-grid">
            {items.map((pattern) => (
              <li key={pattern.slug}>
                <Link href={`/patterns/${pattern.slug}`}>
                  <MediaFrame
                    image={pattern.imageMedia}
                    ratio="1/1"
                    sizes="(max-width: 47.99rem) 100vw, (max-width: 79.99rem) 50vw, 26rem"
                    emptyLabel="ภาพลายอยู่ระหว่างการบันทึก"
                  />
                  <span className="archive-card-title">{pattern.localName || pattern.name}</span>
                  <span className="archive-card-meta">
                    {patternCategoryLabel(pattern.category)}
                    {pattern._count.boats > 0 ? ` · อยู่บนเรือ ${pattern._count.boats} ลำ` : ""}
                  </span>
                  <span className="archive-card-note collection-excerpt">{pattern.characteristics}</span>
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
            { href: "/boats", label: "เรื่องเล่าเรือพระ" },
            { href: "/craft", label: "จากกระดาษสู่เรือพระ" },
          ]}
        />
      </div>
    </main>
  );
}
