import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { BackNav } from "@/components/site/back-nav";
import { ArrowRight, BookOpenText, DraftingCompass, Play, ScrollText, Ship, Trophy, Users } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { award, partners, projectTitle, team, workTitle } from "@/lib/site-info";
import { getExhibitionContent } from "@/lib/services/exhibition";


export const metadata: Metadata = {
  title: "เรือพระเล่าเรื่อง — จากบอร์ดนิทรรศการ",
  description: workTitle,
  robots: { index: false, follow: false },
};

const doors = [
  { href: "/#reader", icon: Ship, label: "อ่านเรือพระทีละจุด", note: "กดจุดบนภาพเรือเพื่อดูว่าแต่ละส่วนคืออะไร" },
  { href: "/#patterns", icon: DraftingCompass, label: "คลังลวดลาย", note: "ลายที่บันทึกไว้ พร้อมความหมายและที่มา" },
  { href: "/craft", icon: ScrollText, label: "จากกระดาษสู่เรือพระ", note: "ขั้นตอนงานช่างตั้งแต่เตรียมวัสดุจนประดับบนเรือ" },
  { href: "/#master", icon: Users, label: "ช่างผู้สืบสาน", note: "คนที่ยังทำงานนี้อยู่ในปากพะยูน" },
  { href: "/learn", icon: BookOpenText, label: "บทเรียน", note: "เรียนตามจังหวะตัวเอง ไม่ต้องสมัครสมาชิก" },
  { href: "/#procession", icon: Play, label: "วันชักพระ", note: "วิดีโอจากพื้นที่จริง" },
  { href: "/competition", icon: Trophy, label: "ผลการประกวด", note: "เรือพระที่ติดอันดับ ตั้งแต่ปีแรกที่ชิงถ้วยพระราชทาน" },
];

/**
 * Where the QR on the exhibition board lands.
 *
 * Written for someone standing in front of a board with a phone in one hand: they have
 * already read the headline on the panel, so this does not repeat it at length. It says
 * what they can do next and gets out of the way. Everything is one tap from here.
 *
 * Deliberately not the homepage. The homepage opens with a full-screen photograph and a
 * twelve-part story meant for someone sitting down — a fine thing to arrive at by choice,
 * and the wrong thing to hand a person who is standing in a hall with people behind them.
 */
/**
 * Rendered when someone asks for it, not when the image is built.
 *
 * `connection()` stops prerendering here, which is what lets the production image be
 * built without a reachable database — a Docker build has no database, and a deploy that
 * only works when one happens to be on the same network is a deploy that fails on the
 * morning of the exhibition. The queries are small and indexed, and Postgres sits beside
 * the app, so paying for them per request is cheaper than the fragility.
 */
export default async function ExhibitionPage() {
  await connection();
  const content = await getExhibitionContent();

  return (
    <main id="main-content" className="exhibit" tabIndex={-1}>
      <header className="shell exhibit-head">
        <p className="section-index">นิทรรศการ</p>
        <h1>เรือพระเล่าเรื่อง</h1>
        <p className="exhibit-tagline">ทุกลายมีเรื่อง ทุกเรื่องมีคนส่งต่อ</p>
        <p className="exhibit-sub">{workTitle}</p>
      </header>

      {content.cover && (
        <figure className="exhibit-figure">
          <MediaFrame
            image={content.cover}
            ratio="3/2"
            priority
            sizes="100vw"
            emptyLabel="ภาพเรือพระอยู่ระหว่างการบันทึก"
          />
        </figure>
      )}

      <section className="shell exhibit-lede" aria-labelledby="exhibit-what">
        <h2 id="exhibit-what">คลังนี้เก็บอะไร</h2>
        <p>
          เรือพระปากพะยูนประดับด้วยลายกระดาษที่ตอกและอัดขึ้นทีละใบ
          เทคนิค ความหมาย และเรื่องเล่าของแต่ละปียังอยู่กับตัวช่าง
          คลังนี้บันทึกสิ่งเหล่านั้นไว้ให้ค้นได้ อ้างอิงได้ และแก้ไขให้ถูกต้องได้
        </p>
        <dl className="exhibit-counts">
          <div>
            <dt>เรือพระที่บันทึกแล้ว</dt>
            <dd>{content.counts.boats}</dd>
          </div>
          <div>
            <dt>จุดสำรวจบนเรือ</dt>
            <dd>{content.counts.sections}</dd>
          </div>
          <div>
            <dt>ลวดลาย</dt>
            <dd>{content.counts.patterns}</dd>
          </div>
          <div>
            <dt>ขั้นตอนงานช่าง</dt>
            <dd>{content.counts.steps}</dd>
          </div>
        </dl>
        {/* The same honesty the rest of the archive keeps, said once here rather than on
            every card — a visitor at a board should not be left thinking this is finished
            scholarship. */}
        <p className="demo-notice">
          บันทึกภาคสนาม · เนื้อหายังรอการตรวจสอบร่วมกับช่างและชุมชน
        </p>
      </section>

      <nav className="shell exhibit-doors" aria-label="เข้าดูส่วนต่าง ๆ ของคลัง">
        <h2>เข้าดูได้เลย</h2>
        <ul>
          {doors.map(({ href, icon: Icon, label, note }) => (
            <li key={href}>
              <Link href={href}>
                <Icon aria-hidden="true" />
                <span>
                  {label}
                  <small>{note}</small>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="shell exhibit-credits" aria-labelledby="exhibit-credits">
        <h2 id="exhibit-credits">ผู้จัดทำ</h2>
        {partners.map((partner) => (
          <div key={partner.key} className="exhibit-credit-group">
            <strong>{partner.name}</strong>
            {partner.parent && <span>{partner.parent}</span>}
            <p>{team.filter((member) => member.partner === partner.key).map((member) => member.name).join(" · ")}</p>
          </div>
        ))}
        <p className="exhibit-award">
          {award.programme} · {award.theme}
          <br />
          {award.round}
        </p>
        <p className="exhibit-award">{projectTitle}</p>
        <Link className="button-solid" href="/about">
          อ่านที่มาและวิธีเก็บข้อมูล
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <BackNav destinations={[{ href: "/", label: "เข้าสู่เว็บไซต์เต็ม" }]} />
    </main>
  );
}
