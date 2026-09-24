import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Lightbulb, Play } from "lucide-react";
import { notFound } from "next/navigation";
import { getProcessStep, parseInstructions } from "@/lib/services/craft";

type Props = { params: Promise<{ stepSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const step = await getProcessStep((await params).stepSlug);
  if (!step) return { title: "ไม่พบขั้นตอน" };
  return { title: `${step.title} | จากกระดาษสู่เรือพระ`, description: step.description };
}

export default async function CraftStepPage({ params }: Props) {
  const step = await getProcessStep((await params).stepSlug);
  if (!step) notFound();

  const instructions = parseInstructions(step.instructions);
  const currentIndex = step.process.steps.findIndex((item) => item.slug === step.slug);
  const previous = currentIndex > 0 ? step.process.steps[currentIndex - 1] : null;
  const next = currentIndex < step.process.steps.length - 1 ? step.process.steps[currentIndex + 1] : null;

  return (
    <main id="main-content" className="step-page" tabIndex={-1}>
      <nav className="step-breadcrumb" aria-label="เส้นทางนำทาง">
        <Link href="/craft">จากกระดาษสู่เรือพระ</Link><span aria-hidden="true">/</span><span aria-current="page">{step.title}</span>
      </nav>

      <header className="step-hero">
        <div className="step-hero-copy">
          <p className="step-number">ขั้นที่ {String(step.position).padStart(2, "0")}</p>
          <h1>{step.title}</h1>
          <p className="step-lead">{step.description}</p>
          {step.verification?.status !== "VERIFIED" && step.verification?.status !== "PUBLISHED" && (
            <p className="demo-notice">
              {step.isDemo
                ? "เนื้อหาสาธิต · ยังไม่ผ่านการตรวจสอบจากผู้รู้ในพื้นที่"
                : "บันทึกภาคสนาม · รอการตรวจสอบจากผู้รู้ในพื้นที่"}
            </p>
          )}
        </div>
        {step.coverMedia?.url ? (
          <figure className="step-hero-image">
            <Image src={step.coverMedia.url} alt={step.coverMedia.alt} fill priority sizes="(max-width: 800px) 100vw, 55vw" />
            {step.coverMedia.credit && <figcaption>{step.coverMedia.credit}</figcaption>}
          </figure>
        ) : <div className="step-media-empty">ยังไม่มีภาพบันทึกของขั้นตอนนี้</div>}
      </header>

      <div className="step-content-grid">
        <aside className="step-context">
          <p className="eyebrow">เหตุใดขั้นนี้จึงสำคัญ</p>
          <p>{step.importance}</p>
        </aside>

        <div className="step-main-content">
          <section className="step-section" aria-labelledby="method-title">
            <p className="section-kicker">ลำดับงาน</p>
            <h2 id="method-title">มองกระบวนการทีละจังหวะ</h2>
            {instructions.length > 0 ? (
              <ol className="instruction-list">
                {instructions.map((instruction, index) => (
                  <li key={`${instruction.order}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{instruction.text}</p></li>
                ))}
              </ol>
            ) : <p className="inline-empty">ยังไม่มีลำดับวิธีที่บันทึกไว้</p>}
          </section>

          <section className="step-section" aria-labelledby="media-title">
            <p className="section-kicker">ภาพและเสียง</p>
            <h2 id="media-title">บันทึกจากขั้นตอน</h2>
            {step.videoMedia?.url ? (
              <figure className="step-video">
                <video controls preload="metadata" aria-label={step.videoMedia.alt}>
                  <source src={step.videoMedia.url} type={step.videoMedia.mimeType} />
                </video>
                {step.videoMedia.credit && <figcaption>{step.videoMedia.credit}</figcaption>}
              </figure>
            ) : (
              <div className="step-media-empty"><Play aria-hidden="true" /><p>ยังไม่มีวิดีโอภาคสนามสำหรับขั้นตอนนี้</p><small>พื้นที่นี้พร้อมรับไฟล์เมื่อมีการบันทึกและสิทธิ์เผยแพร่</small></div>
            )}
            {step.media.length > 0 && (
              <div className="step-gallery">
                {step.media.map(({ media, caption, position }) => media.url && (
                  <figure key={`${position}-${media.url}`}>
                    <div><Image src={media.url} alt={media.alt} fill sizes="(max-width: 760px) 100vw, 38vw" /></div>
                    {(caption || media.credit) && <figcaption>{caption || media.credit}</figcaption>}
                  </figure>
                ))}
              </div>
            )}
          </section>

          <section className="step-section" aria-labelledby="resources-title">
            <p className="section-kicker">ของที่อยู่บนโต๊ะช่าง</p>
            <h2 id="resources-title">วัสดุ เครื่องมือ และเทคนิค</h2>
            <div className="resource-columns">
              <ResourceList title="วัสดุ" entries={step.materials.map(({ material, quantityNote }) => ({ name: material.name, description: material.description, note: quantityNote }))} />
              <ResourceList title="เครื่องมือ" entries={step.tools.map(({ tool, usageNote }) => ({ name: tool.name, description: tool.description, note: usageNote }))} />
              <ResourceList title="เทคนิค" entries={step.techniques.map(({ technique, note }) => ({ name: technique.name, description: technique.description, note }))} />
            </div>
          </section>

          {(step.tips || step.warnings) && (
            <section className="knowledge-notes" aria-label="คำแนะนำและข้อควรระวัง">
              {step.tips && <div><Lightbulb aria-hidden="true" /><h2>คำแนะนำจากช่าง</h2><p>{step.tips}</p></div>}
              {step.warnings && <div className="warning-note"><AlertTriangle aria-hidden="true" /><h2>ข้อควรระวัง</h2><p>{step.warnings}</p></div>}
            </section>
          )}

          {(step.patterns.length > 0 || step.masters.length > 0) && (
            <section className="step-section" aria-labelledby="connections-title">
              <p className="section-kicker">ความรู้ที่เชื่อมต่อกัน</p>
              <h2 id="connections-title">ลวดลายและผู้ถ่ายทอด</h2>
              <div className="knowledge-connections">
                {step.patterns.map(({ pattern }) => (
                  <Link key={pattern.slug} href={`/patterns/${pattern.slug}`}><span>ลวดลาย</span><strong>{pattern.localName || pattern.name}</strong><ArrowRight aria-hidden="true" /></Link>
                ))}
                {step.masters.map(({ master, contribution }) => (
                  <Link key={master.slug} href={`/masters/${master.slug}`}><span>ช่างผู้เกี่ยวข้อง</span><strong>{master.name}</strong>{contribution && <small>{contribution}</small>}<ArrowRight aria-hidden="true" /></Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <nav className="step-pagination" aria-label="ขั้นตอนก่อนหน้าและถัดไป">
        {previous ? <Link href={`/craft/${previous.slug}`}><ArrowLeft aria-hidden="true" /><span>ขั้นก่อนหน้า<small>{previous.title}</small></span></Link> : <span />}
        {next && <Link href={`/craft/${next.slug}`}><span>ขั้นถัดไป<small>{next.title}</small></span><ArrowRight aria-hidden="true" /></Link>}
      </nav>
    </main>
  );
}

function ResourceList({ title, entries }: { title: string; entries: Array<{ name: string; description: string; note?: string | null }> }) {
  return (
    <section>
      <h3>{title}</h3>
      {entries.length > 0 ? <ul>{entries.map((entry) => <li key={entry.name}><strong>{entry.name}</strong><p>{entry.description}</p>{entry.note && <small>{entry.note}</small>}</li>)}</ul> : <p className="inline-empty">ยังไม่มีข้อมูล</p>}
    </section>
  );
}
