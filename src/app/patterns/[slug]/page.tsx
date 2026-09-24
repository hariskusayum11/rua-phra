import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { VerificationNote } from "@/components/archive/verification-note";
import { getPatternDetail } from "@/lib/services/patterns";

type Props = { params: Promise<{ slug: string }> };

const categoryLabels: Record<string, string> = {
  FLORAL: "ลายดอก",
  FOLIAGE: "ลายใบ",
  GEOMETRIC: "ลายเรขาคณิต",
  MYTHICAL: "ลายสัตว์หิมพานต์",
  OTHER: "อื่น ๆ",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pattern = await getPatternDetail((await params).slug);
  if (!pattern) return { title: "ไม่พบลวดลาย" };
  return { title: pattern.localName || pattern.name, description: pattern.characteristics };
}

export default async function PatternDetailPage({ params }: Props) {
  const pattern = await getPatternDetail((await params).slug);
  if (!pattern) notFound();

  const boats = pattern.boats.map(({ boat }) => boat);
  const sections = pattern.sections.map(({ section }) => section);
  const masters = pattern.masters.map(({ master }) => master);
  const steps = pattern.steps.map(({ step }) => step).sort((a, b) => a.position - b.position);

  return (
    <main id="main-content" className="archive-page" tabIndex={-1}>
      <article className="shell archive-lede">
        <p className="section-index">คลังลวดลาย / {categoryLabels[pattern.category] ?? pattern.category}</p>
        <h1>{pattern.localName || pattern.name}</h1>
        {pattern.localName && <p className="archive-alt-name">ชื่อที่บันทึกไว้ · {pattern.name}</p>}
        <p className="lead archive-lede-text">{pattern.characteristics}</p>
        <VerificationNote status={pattern.verification?.status} isDemo={pattern.isDemo} />
      </article>

      <figure className="shell archive-figure">
        <MediaFrame
          image={pattern.imageMedia}
          ratio="4/5"
          priority
          sizes="(max-width: 63.99rem) 100vw, 46vw"
          emptyLabel="ภาพลวดลายอยู่ระหว่างการบันทึก"
        />
        {pattern.imageMedia?.credit && <figcaption className="caption">{pattern.imageMedia.credit}</figcaption>}
      </figure>

      {(pattern.meaning || pattern.historicalNote) && (
        <section className="shell archive-body" aria-labelledby="pattern-meaning">
          <h2 id="pattern-meaning">ความหมายและที่มา</h2>
          {pattern.meaning && <p>{pattern.meaning}</p>}
          {pattern.historicalNote && <p>{pattern.historicalNote}</p>}
        </section>
      )}

      <section className="shell archive-connections" aria-labelledby="pattern-connections">
        <h2 id="pattern-connections">ลายนี้เชื่อมกับอะไรบ้าง</h2>

        <div className="archive-group">
          <h3>เรือที่ใช้ลายนี้</h3>
          {boats.length === 0 ? (
            <p className="empty-note">ยังไม่ได้บันทึกว่าลายนี้อยู่บนเรือลำใด</p>
          ) : (
            <ul className="archive-card-list">
              {boats.map((boat) => (
                <li key={boat.slug}>
                  <Link href={`/boats/${boat.slug}`}>
                    <MediaFrame image={boat.coverMedia} ratio="16/9" sizes="(max-width: 47.99rem) 100vw, 22rem" />
                    <span className="archive-card-title">{boat.name}</span>
                    <span className="archive-card-meta">{boat.temple.name} · พ.ศ. {boat.year}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {sections.length > 0 && (
          <div className="archive-group">
            <h3>จุดบนเรือที่พบลายนี้</h3>
            <ul className="archive-link-list">
              {sections.map((section) => (
                <li key={`${section.boat.slug}-${section.slug}`}>
                  <Link href={`/boats/${section.boat.slug}`}>
                    <span>{section.name}</span>
                    <small>{section.boat.name} · พ.ศ. {section.boat.year}</small>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="archive-group">
          <h3>ช่างที่ทำลายนี้</h3>
          {masters.length === 0 ? (
            <p className="empty-note">ยังไม่ได้บันทึกว่าช่างคนใดทำลายนี้</p>
          ) : (
            <ul className="archive-link-list">
              {masters.map((master) => (
                <li key={master.slug}>
                  <Link href={`/masters/${master.slug}`}>
                    <span>{master.name}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {steps.length > 0 && (
          <div className="archive-group">
            <h3>ขั้นตอนที่ทำให้เกิดลายนี้</h3>
            <ul className="archive-link-list">
              {steps.map((step) => (
                <li key={step.slug}>
                  <Link href={`/craft/${step.slug}`}>
                    <span>{String(step.position).padStart(2, "0")} {step.title}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <nav className="shell archive-back" aria-label="กลับไปยังคลัง">
        <Link className="editorial-link" href="/#patterns">
          กลับไปคลังลวดลาย
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </nav>
    </main>
  );
}
