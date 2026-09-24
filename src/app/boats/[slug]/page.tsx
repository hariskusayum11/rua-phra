import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoatExplorer } from "@/components/boat/boat-explorer";
import { getBoatExplorer } from "@/lib/services/boats";

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

  return (
    <main id="main-content" className="boat-page" tabIndex={-1}>
      <header className="boat-intro">
        <p className="eyebrow">{boat.temple.name} · พ.ศ. {boat.year}</p>
        <h1>{boat.name}</h1>
        <p className="boat-concept">“{boat.concept}”</p>
        <p>{boat.summary}</p>
        {boat.isDemo && <p className="demo-notice">ข้อมูลสาธิต · ยังไม่ผ่านการตรวจสอบองค์ความรู้</p>}
      </header>
      <BoatExplorer boat={boat} />
    </main>
  );
}
