import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackNav } from "@/components/site/back-nav";
import { BoatExplorer } from "@/components/boat/boat-explorer";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getBoatExplorer } from "@/lib/services/boats";
import { getTempleRecord } from "@/lib/services/competition";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const boat = await getBoatExplorer((await params).slug);
  if (!boat) return { title: "ไม่พบเรือพระ" };
  // The root layout appends the site name through its title template.
  return { title: boat.name, description: boat.summary };
}

export default async function BoatDetailPage({ params }: Props) {
  const boat = await getBoatExplorer((await params).slug);
  if (!boat) notFound();
  // What this temple has done in the competition, if anything is on record. The archive
  // documents one boat closely; this is the line that says where that boat sits among the
  // others, without the page having to assert it.
  const record = boat.isDemo ? null : await getTempleRecord(boat.temple.id);

  return (
    <main id="main-content" className="boat-page" tabIndex={-1}>
      <header className="boat-intro">
        <p className="eyebrow">{boat.temple.name} · พ.ศ. {boat.year}</p>
        <h1>{boat.name}</h1>
        <p className="boat-concept">“{boat.concept}”</p>
        <p>{boat.summary}</p>
        {record && (
          <div className="boat-record">
            <p>
              <Trophy aria-hidden="true" />
              <span>
                {record.templeName} ติดอันดับ {record.placings} ครั้ง
                {record.wins > 0 ? ` ได้ที่ 1 จำนวน ${record.wins} ครั้ง` : ""} ระหว่าง พ.ศ. {record.firstYear}–{record.lastYear}
              </span>
            </p>
            <Link className="editorial-link" href="/competition">ดูผลการประกวดทั้งหมด</Link>
          </div>
        )}
        {boat.isDemo && <p className="demo-notice">ข้อมูลสาธิต · ยังไม่ผ่านการตรวจสอบองค์ความรู้</p>}
      </header>
      <BoatExplorer boat={boat} />
      <BackNav
        destinations={[
          { href: "/#boats", label: "เรือพระลำอื่น" },
          { href: "/craft", label: "ขั้นตอนงานช่าง" },
          { href: "/", label: "หน้าหลัก" },
        ]}
      />
    </main>
  );
}
