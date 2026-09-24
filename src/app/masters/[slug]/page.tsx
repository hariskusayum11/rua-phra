import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Play } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { VerificationNote } from "@/components/archive/verification-note";
import { getMasterDetail, yearsOfPractice } from "@/lib/services/masters";
import { mediaUrl } from "@/lib/services/media";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const master = await getMasterDetail((await params).slug);
  if (!master) return { title: "ไม่พบข้อมูลช่าง" };
  return { title: master.name, description: master.biography };
}

export default async function MasterDetailPage({ params }: Props) {
  const master = await getMasterDetail((await params).slug);
  if (!master) notFound();

  const years = yearsOfPractice(master.practiceSinceYear);
  const interview = mediaUrl(master.interviewMedia?.url);
  const boats = master.boats.map((entry) => ({ ...entry.boat, contribution: entry.contribution }));
  const patterns = master.patterns.map(({ pattern }) => pattern);
  const steps = master.steps
    .map((entry) => ({ ...entry.step, contribution: entry.contribution }))
    .sort((a, b) => a.position - b.position);

  return (
    <main id="main-content" className="archive-page" tabIndex={-1}>
      <article className="shell archive-lede">
        <p className="section-index">ช่างผู้สืบสาน</p>
        <h1>{master.name}</h1>
        <p className="archive-alt-name">
          {years
            ? `สืบทอดงานกระดาษมาแล้วราว ${years} ปี · เริ่ม พ.ศ. ${master.practiceSinceYear}`
            : "ยังไม่ได้บันทึกปีที่เริ่มทำงาน"}
        </p>
        <VerificationNote status={master.verification?.status} isDemo={master.isDemo} />
      </article>

      <figure className="shell archive-figure">
        <MediaFrame
          image={master.portraitMedia}
          ratio="4/5"
          priority
          sizes="(max-width: 63.99rem) 100vw, 46vw"
          emptyLabel="ภาพช่างอยู่ระหว่างการบันทึกภาคสนาม"
        />
        {master.portraitMedia?.credit && <figcaption className="caption">{master.portraitMedia.credit}</figcaption>}
      </figure>

      {/* Quotation marks only where someone was actually quoted. */}
      {master.quote && (
        <section className="shell archive-quote-block" aria-label="คำบอกเล่าจากช่าง">
          <blockquote className="archive-quote">{master.quote}</blockquote>
          <p className="archive-quote-source">— {master.name}</p>
        </section>
      )}

      <section className="shell archive-body" aria-labelledby="master-bio">
        <h2 id="master-bio">ประวัติและงานที่ทำ</h2>
        <p>{master.biography}</p>

        {master.expertise.length > 0 && (
          <ul className="archive-tags">
            {master.expertise.map(({ title }) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        )}

        {interview ? (
          <figure className="archive-audio">
            <figcaption>ฟังเรื่องจากช่าง</figcaption>
            <audio controls preload="none" src={interview} aria-label={`บันทึกเสียงสัมภาษณ์ ${master.name}`} />
            {master.interviewMedia?.credit && <p className="caption">{master.interviewMedia.credit}</p>}
          </figure>
        ) : (
          <p className="upcoming-link">
            <Play aria-hidden="true" width={16} height={16} />
            ฟังเรื่องจากช่าง <span>รอการบันทึกและขออนุญาต</span>
          </p>
        )}
      </section>

      <section className="shell archive-connections" aria-labelledby="master-connections">
        <h2 id="master-connections">ผลงานที่เชื่อมโยง</h2>

        <div className="archive-group">
          <h3>เรือที่ร่วมสร้าง</h3>
          {boats.length === 0 ? (
            <p className="empty-note">ยังไม่ได้บันทึกว่าร่วมสร้างเรือลำใด</p>
          ) : (
            <ul className="archive-card-list">
              {boats.map((boat) => (
                <li key={boat.slug}>
                  <Link href={`/boats/${boat.slug}`}>
                    <MediaFrame image={boat.coverMedia} ratio="16/9" sizes="(max-width: 47.99rem) 100vw, 22rem" />
                    <span className="archive-card-title">{boat.name}</span>
                    <span className="archive-card-meta">{boat.temple.name} · พ.ศ. {boat.year}</span>
                    {boat.contribution && <span className="archive-card-note">{boat.contribution}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="archive-group">
          <h3>ลวดลายที่ชำนาญ</h3>
          {patterns.length === 0 ? (
            <p className="empty-note">ยังไม่ได้บันทึกลวดลายของช่างคนนี้</p>
          ) : (
            <ul className="archive-link-list">
              {patterns.map((pattern) => (
                <li key={pattern.slug}>
                  <Link href={`/patterns/${pattern.slug}`}>
                    <span>{pattern.localName || pattern.name}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {steps.length > 0 && (
          <div className="archive-group">
            <h3>ขั้นตอนที่ถ่ายทอด</h3>
            <ul className="archive-link-list">
              {steps.map((step) => (
                <li key={step.slug}>
                  <Link href={`/craft/${step.slug}`}>
                    <span>{String(step.position).padStart(2, "0")} {step.title}</span>
                    {step.contribution && <small>{step.contribution}</small>}
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <nav className="shell archive-back" aria-label="กลับไปยังหน้าแรก">
        <Link className="editorial-link" href="/#master">
          กลับไปส่วนช่างผู้สืบสาน
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </nav>
    </main>
  );
}
