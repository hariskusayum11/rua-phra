import { Play } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { Reveal } from "@/components/motion/reveal";
import type { HomeContent } from "@/lib/services/home";

/** The archive records the year practice began, so the count stays true as years pass. */
function yearsOfPractice(since: number | null) {
  if (!since) return null;
  const currentBuddhistYear = new Date().getFullYear() + 543;
  const years = currentBuddhistYear - since;
  return years > 0 ? years : null;
}

/**
 * Section 08 — the page turns from object to person, and gives that turn the whole screen.
 *
 * The portrait runs full-bleed behind a single large quote. Biography, expertise and the
 * recording sit underneath as quiet information, so the encounter comes first and the
 * record second.
 */
export function MasterArtisan({ master }: { master: HomeContent["master"] }) {
  if (!master) {
    return (
      <section className="home-master" id="master" aria-labelledby="master-title">
        <div className="shell">
          <p className="section-index">07 / คนผู้ส่งต่อ</p>
          <h2 id="master-title">ภูมิปัญญาไม่ได้อยู่เพียงในตำรา แต่อยู่ในคน</h2>
          <p className="empty-note">ยังไม่มีข้อมูลช่างที่บันทึกไว้ในคลัง</p>
        </div>
      </section>
    );
  }

  const years = yearsOfPractice(master.practiceSinceYear);
  const interview = master.interviewMedia?.url ?? null;

  return (
    <section className="home-master on-dark" id="master" aria-labelledby="master-title">
      <div className="home-master-stage">
        <div className="home-master-portrait">
          <MediaFrame
            image={master.portraitMedia}
            ratio="fill"
            sizes="100vw"
            emptyLabel="ภาพช่างอยู่ระหว่างการบันทึกภาคสนาม"
          />
        </div>
        <div className="home-master-veil" aria-hidden="true" />

        <div className="shell home-master-quote-block">
          <h2 className="section-index home-master-kicker" id="master-title">07 / คนผู้ส่งต่อ</h2>
          {/* A quote is only a quote when someone actually said it. Until the interview is
              recorded, the section carries the archive's own statement, unattributed, and
              names the person in a caption instead of under quotation marks. */}
          {master.quote ? (
            <>
              <blockquote className="home-master-quote">{master.quote}</blockquote>
              <p className="home-master-attribution">
                — {master.name}
                {years ? ` · สืบทอดงานกระดาษมาแล้วราว ${years} ปี` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="home-master-quote" data-unattributed="true">
                ภูมิปัญญาไม่ได้อยู่เพียงในตำรา แต่อยู่ในคน
              </p>
              <p className="home-master-attribution">
                ในภาพ: {master.name}
                {years ? ` · สืบทอดงานกระดาษมาแล้วราว ${years} ปี` : " · ยังไม่ได้บันทึกชื่อและคำบอกเล่าของช่าง"}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="shell home-master-record">
        <Reveal className="home-master-bio">
          <p>{master.biography}</p>
        </Reveal>

        <Reveal className="home-master-meta" delay={90}>
          {master.expertise.length > 0 && (
            <ul className="home-master-expertise">
              {master.expertise.map(({ title }) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          )}

          {interview ? (
            <figure className="home-master-audio">
              <figcaption>ฟังเรื่องจากช่าง</figcaption>
              <audio controls preload="none" src={interview} aria-label={`บันทึกเสียงสัมภาษณ์ ${master.name}`} />
            </figure>
          ) : (
            <p className="upcoming-link">
              <Play aria-hidden="true" width={16} height={16} />
              ฟังเรื่องจากช่าง <span>รอการบันทึกและขออนุญาต</span>
            </p>
          )}

          {master.isDemo && <p className="demo-flag">ข้อมูลสาธิต · บุคคลสมมติสำหรับทดสอบระบบ</p>}
        </Reveal>
      </div>
    </section>
  );
}
