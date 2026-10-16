import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import type { HomeContent } from "@/lib/services/home";

/**
 * Section 01 — the only part of the page that loads its photograph eagerly. Everything
 * below the fold waits for the reader to arrive.
 *
 * The hero carries four things and no metadata: the name, the promise, one line of
 * orientation, and the way in. Anything else competes with the photograph.
 */
export function Hero({ boat }: { boat: HomeContent["heroBoat"] }) {
  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <div className="home-hero-media">
        <MediaFrame
          image={boat?.coverMedia ?? null}
          ratio="fill"
          priority
          sizes="100vw"
          emptyLabel="ภาพเรือพระอยู่ระหว่างการบันทึกภาคสนาม"
        />
      </div>
      <div className="home-hero-veil" aria-hidden="true" />

      <div className="home-hero-inner shell">
        <div className="home-hero-copy">
          <h1 id="hero-title" className="home-hero-title">เรือพระเล่าเรื่อง</h1>
          <p className="home-hero-tagline">
            ทุกลายมีเรื่อง
            <br />
            ทุกเรื่องมีคนส่งต่อ
          </p>
          <p className="home-hero-sub">
            เรื่องราวของเรือพระ ภูมิปัญญาที่อยู่ในมือของช่าง
            <br />
            และการส่งต่อสู่คนรุ่นใหม่
          </p>
          {/* Two ways in, of unequal weight. The orange one stays the obvious choice —
              filled, raised, carrying the arrow — and the outline one is there for the
              visitor who came to learn rather than to browse. */}
          <div className="home-hero-actions">
            <Link className="button-solid" data-tone="accent" href="#introduction">
              สำรวจเรื่องราว
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="button-outline" data-tone="on-dark" href="/learn">
              เส้นทางการเรียนรู้
            </Link>
          </div>
        </div>

        <a className="home-hero-scroll" href="#introduction">
          เลื่อนเพื่อค้นพบ
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
