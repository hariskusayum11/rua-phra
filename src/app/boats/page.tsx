import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { MediaFrame } from "@/components/media/media-frame";
import { BackNav } from "@/components/site/back-nav";
import { CollectionStatus, PageHeader } from "@/components/site/page-header";
import { getBoatIndex } from "@/lib/services/collections";

export const metadata: Metadata = {
  title: "เรื่องเล่าเรือพระ",
  description: "เรือพระจากวัดต่าง ๆ ในอำเภอปากพะยูน จังหวัดพัทลุง ที่คลังบันทึกภาพและส่วนประกอบไว้",
};

/**
 * Every boat in the archive.
 *
 * The homepage shows one boat closely; this is where the rest live. Until it existed the
 * only way to reach most boats was a QR code at the temple, so a visitor at home could
 * not find what someone standing beside the boat could.
 */
export default async function BoatsPage() {
  await connection();
  const { items, showingDemo, pending } = await getBoatIndex();

  return (
    <main id="main-content" className="collection-page" tabIndex={-1}>
      <PageHeader
        label="เรื่องเล่าเรือพระ"
        lead="เรือพระจากวัดต่าง ๆ ในอำเภอปากพะยูน เลือกลำที่สนใจเพื่อดูส่วนประกอบและภาพระยะใกล้"
      >
        <CollectionStatus pending={pending} total={items.length} showingDemo={showingDemo} />
      </PageHeader>

      <section className="shell" aria-label={`เรือพระ ${items.length} ลำ`}>
        {items.length === 0 ? (
          <p className="empty-note">ยังไม่มีเรือพระที่บันทึกไว้ในคลัง</p>
        ) : (
          <ul className="archive-card-list collection-grid">
            {items.map((boat) => (
              <li key={boat.slug}>
                <Link href={`/boats/${boat.slug}`}>
                  <MediaFrame
                    image={boat.coverMedia}
                    ratio="3/2"
                    sizes="(max-width: 47.99rem) 100vw, (max-width: 79.99rem) 50vw, 26rem"
                    emptyLabel="ภาพเรืออยู่ระหว่างการบันทึก"
                  />
                  <span className="archive-card-title">{boat.name}</span>
                  <span className="archive-card-meta">{boat.temple.name} · พ.ศ. {boat.year}</span>
                  <span className="archive-card-note">
                    {boat._count.sections > 0 ? `${boat._count.sections} จุดสำรวจบนภาพ` : "ยังไม่มีจุดสำรวจบนภาพ"}
                  </span>
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
            { href: "/competition", label: "ผลการประกวด" },
            { href: "/patterns", label: "คลังลวดลาย" },
          ]}
        />
      </div>
    </main>
  );
}
