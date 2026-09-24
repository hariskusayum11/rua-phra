import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { Reveal } from "@/components/motion/reveal";
import type { HomePattern } from "@/lib/services/home";

const categoryLabels: Record<string, string> = {
  FLORAL: "ลายดอก",
  FOLIAGE: "ลายใบ",
  GEOMETRIC: "ลายเรขาคณิต",
  MYTHICAL: "ลายสัตว์หิมพานต์",
  OTHER: "อื่น ๆ",
};

/**
 * Section 07 — patterns at varying weight rather than an even grid. Metadata is printed
 * under every image, never revealed on hover, so a touch screen loses nothing.
 */
export function PatternArchive({ patterns }: { patterns: HomePattern[] }) {
  return (
    <section className="home-patterns" id="patterns" aria-labelledby="patterns-title">
      <div className="shell home-patterns-head">
        <div>
          <p className="section-index">06 / คลังลวดลาย</p>
          <h2 id="patterns-title">ลวดลายที่บันทึกเรื่องราว</h2>
        </div>
        <p className="home-patterns-count">{patterns.length} ลวดลายในคลัง</p>
      </div>

      {patterns.length === 0 ? (
        <div className="shell">
          <p className="empty-note">ยังไม่มีลวดลายที่บันทึกไว้ในคลัง</p>
        </div>
      ) : (
        <div className="shell">
          <ul className="home-pattern-wall">
            {patterns.map((pattern, index) => {
              const boat = pattern.boats[0]?.boat;
              // The first recorded pattern carries the wall; the others support it.
              const dominant = index === 0;
              return (
                <Reveal
                  as="li"
                  key={pattern.slug}
                  className="home-pattern-cell"
                  data-lane={dominant ? "dominant" : "supporting"}
                  delay={(index % 3) * 90}
                >
                  <figure>
                    <MediaFrame
                      image={pattern.imageMedia}
                      ratio={dominant ? "4/5" : "1/1"}
                      sizes={dominant ? "(max-width: 63.99rem) 100vw, 46vw" : "(max-width: 47.99rem) 50vw, 26vw"}
                      emptyLabel="ภาพลวดลายอยู่ระหว่างการบันทึก"
                    />
                    <figcaption>
                      <h3>{pattern.localName || pattern.name}</h3>
                      <p className="home-pattern-meta">
                        {categoryLabels[pattern.category] ?? pattern.category}
                        {pattern.localName ? ` · ${pattern.name}` : ""}
                      </p>
                      <p className="home-pattern-text">{pattern.characteristics}</p>
                      {boat ? (
                        <Link className="editorial-link" href={`/boats/${boat.slug}`}>
                          ดูลายนี้บน{boat.name}
                          <ArrowUpRight aria-hidden="true" />
                        </Link>
                      ) : (
                        <p className="upcoming-link">
                          ยังไม่ได้เชื่อมกับเรือลำใด <span>รอข้อมูล</span>
                        </p>
                      )}
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
