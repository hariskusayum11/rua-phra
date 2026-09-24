import { MediaFrame } from "@/components/media/media-frame";
import { Reveal } from "@/components/motion/reveal";
import type { HomeWork } from "@/lib/services/home";

/** Section 10 — learner work hung as an exhibition wall rather than a tidy grid. */
export function NextGeneration({ works }: { works: HomeWork[] }) {
  return (
    <section className="home-next" id="next-generation" aria-labelledby="next-title">
      <div className="shell home-next-head">
        <p className="section-index">09 / คนรุ่นใหม่</p>
        <h2 id="next-title">เมื่อภูมิปัญญาถูกส่งต่อ</h2>
        <p className="lead">
          จากการเรียนรู้ภูมิปัญญาเดิม สู่การตีความและสร้างสรรค์ของคนรุ่นใหม่
        </p>
      </div>

      {works.length === 0 ? (
        <div className="shell">
          <p className="empty-note">ยังไม่มีผลงานของผู้เรียนที่เผยแพร่ ผลงานจะปรากฏที่นี่เมื่อผู้เรียนส่งงานและได้รับการเผยแพร่</p>
        </div>
      ) : (
        <div className="shell">
          <ul className="home-next-wall">
            {works.map((work, index) => (
              <Reveal as="li" key={work.slug} delay={(index % 4) * 100}>
                <figure>
                  <MediaFrame
                    image={work.media[0] ? { url: work.media[0].url, alt: work.media[0].alt } : null}
                    ratio="4/5"
                    sizes="(max-width: 47.99rem) 70vw, (max-width: 63.99rem) 40vw, 28vw"
                    emptyLabel="ภาพผลงานอยู่ระหว่างการบันทึก"
                  />
                  <figcaption>
                    <h3>{work.title}</h3>
                    <p className="home-next-author">
                      {work.user.name ?? "ผู้เรียน"}
                      {work.pattern ? ` · ต่อยอดจาก${work.pattern.localName || work.pattern.name}` : ""}
                    </p>
                    <p className="home-next-concept">{work.concept}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
          <p className="upcoming-link home-next-more">
            ชมผลงานทั้งหมด <span>เปิดพร้อมระบบเรียนรู้</span>
          </p>
        </div>
      )}
    </section>
  );
}
