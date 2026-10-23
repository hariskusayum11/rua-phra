import type { Metadata } from "next";
import { BoatBrowser } from "./boat-browser";
import "./boats-index.css";
import { connection } from "next/server";

import { BackNav } from "@/components/site/back-nav";
import { CollectionStatus } from "@/components/site/page-header";
import { getBoatIndex } from "@/lib/services/collections";

export const metadata: Metadata = {
  title: "เรื่องเล่าเรือพระ",
  description: "เรือพระจากวัดต่าง ๆ ในอำเภอปากพะยูน จังหวัดพัทลุง ที่คลังบันทึกภาพและส่วนประกอบไว้",
};

/**
 * Every boat in the archive.
 *
 * The homepage shows one boat closely; this is where the rest live. Until it existed the
 * only way to reach most boats was a QR code at the temple, so a visitor at home could
 * not find what someone standing beside the boat could.
 */
export default async function BoatsPage() {
  await connection();
  const { items, showingDemo, pending } = await getBoatIndex();

  return (
    <main id="main-content" className="collection-page boats-index" tabIndex={-1}>
      <BoatBrowser items={items}><CollectionStatus pending={pending} total={items.length} showingDemo={showingDemo} /></BoatBrowser>
      <div className="shell">
        <BackNav
          destinations={[
            { href: "/", label: "กลับหน้าแรก" },
            { href: "/competition", label: "ผลการประกวด" },
            { href: "/patterns", label: "คลังลวดลาย" },
          ]}
        />
      </div>
    </main>
  );
}
