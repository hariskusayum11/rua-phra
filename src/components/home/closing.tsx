import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import type { HomeContent } from "@/lib/services/home";

/** Section 11 — the last beat of the story, and the only place the tagline returns. */
export function Closing({ image, boatSlug }: { image: HomeContent["closingImage"]; boatSlug: string | null }) {
  return (
    <section className="home-closing on-dark" aria-labelledby="closing-title">
      <div className="home-closing-media">
        <MediaFrame image={image} ratio="fill" sizes="100vw" decorative focalY={45} />
      </div>
      <div className="home-closing-veil" aria-hidden="true" />

      <div className="shell home-closing-inner">
        <h2 id="closing-title" className="home-closing-title">
          เรือพระไม่ได้มีชีวิต
          <br />
          เพราะถูกเก็บไว้
        </h2>
        <p className="home-closing-lead">แต่เพราะยังมีคนเรียนรู้ และส่งต่อ</p>
        <Link className="button-solid" data-tone="paper" href={boatSlug ? `/boats/${boatSlug}` : "/craft"}>
          เริ่มสำรวจเรื่องราว
          <ArrowRight aria-hidden="true" />
        </Link>
        <p className="home-closing-tagline">ทุกลายมีเรื่อง ทุกเรื่องมีคนส่งต่อ</p>
      </div>
    </section>
  );
}
