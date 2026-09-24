import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { Reveal } from "@/components/motion/reveal";
import type { HomeContent } from "@/lib/services/home";

/** Section 03 — the thing this archive exists to preserve, at macro focal length. */
export function UniqueCraft({ image, step }: { image: HomeContent["craftImage"]; step: HomeContent["craftStep"] }) {
  return (
    <section className="home-craft" id="craft" aria-labelledby="craft-title">
      <div className="shell home-craft-inner">
        <Reveal as="figure" className="home-craft-figure">
          <MediaFrame
            image={image}
            ratio="4/5"
            sizes="(max-width: 63.99rem) 100vw, 46vw"
            focalY={45}
            emptyLabel="ภาพงานกระดาษระยะใกล้อยู่ระหว่างการบันทึก"
          />
          {image?.credit && <figcaption className="caption">{image.credit}</figcaption>}
        </Reveal>

        <div className="home-craft-copy">
          <Reveal>
            <p className="section-index">02 / ภูมิปัญญา</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 id="craft-title">
              จากกระดาษ
              <br />
              สู่ศิลปะบนเรือพระ
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="home-craft-text">
              ลวดลายบนเรือพระไม่ได้เกิดจากการพิมพ์ แต่เกิดจากมือ กระดาษถูกออกแบบ ตอก อัด
              และประกอบทีละชิ้น ความรู้เรื่องแรงกด จังหวะช่องไฟ และการอ่านลายในระยะไกล
              ล้วนอยู่ในตัวช่าง ไม่ได้อยู่ในตำรา
            </p>
          </Reveal>
          {step && (
            <Reveal delay={190}>
              <p className="home-craft-note">
                ขั้นตอนที่เห็นในภาพ · <strong>{step.title}</strong> — {step.description}
              </p>
            </Reveal>
          )}
          <Reveal delay={240}>
            <Link className="editorial-link" href="/craft">
              ค้นพบวิธีสร้าง
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
