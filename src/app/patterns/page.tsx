import type { Metadata } from "next";
import { PatternTimeline } from "@/components/archive/pattern-timeline";
import { buildPatternHistory } from "@/lib/pattern-history";
import { PatternBrowser } from "./pattern-browser";

import "./patterns-index.css";
import { connection } from "next/server";

import { BackNav } from "@/components/site/back-nav";
import { CollectionStatus } from "@/components/site/page-header";

import { getPatternIndex } from "@/lib/services/collections";

export const metadata: Metadata = {
  title: "คลังลวดลาย",
  description: "ลวดลายที่บันทึกจากเรือพระปากพะยูน พร้อมลักษณะ ความหมาย และเรือที่ใช้ลายนั้น",
};

/**
 * Every recorded pattern.
 *
 * Before this page the pattern entries had no way in from the site at all — the homepage
 * cards linked to the boat instead — so each one could only be reached by its QR code.
 */
export default async function PatternsPage() {
  await connection();
  const { items, showingDemo, pending } = await getPatternIndex();

  return (
    <main id="main-content" className="collection-page patterns-gallery" tabIndex={-1}>
      <PatternBrowser items={items} timeline={<PatternTimeline records={buildPatternHistory(items)} />}>
        <CollectionStatus pending={pending} total={items.length} showingDemo={showingDemo} />
      </PatternBrowser>

      <div className="shell">
        <BackNav
          destinations={[
            { href: "/", label: "กลับหน้าแรก" },
            { href: "/boats", label: "เรื่องเล่าเรือพระ" },
            { href: "/craft", label: "จากกระดาษสู่เรือพระ" },
          ]}
        />
      </div>
    </main>
  );
}
