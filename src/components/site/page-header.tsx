import Link from "next/link";

/**
 * Where you are, said in the same words as the menu item that brought you here.
 *
 * A reader who taps "คลังลวดลาย" should land on a page that says "คลังลวดลาย" — not on a
 * poetic headline they have to map back to the button themselves. The trail is also the
 * way home for someone who arrived from a QR code with no history to go back through.
 */
export function PageCrumbs({ label }: { label: string }) {
  return (
    <nav className="page-crumbs" aria-label="ตำแหน่งในเว็บไซต์">
      <ol>
        <li><Link href="/">หน้าแรก</Link></li>
        <li aria-current="page">{label}</li>
      </ol>
    </nav>
  );
}

/** The top of a collection page: the trail, the menu label as the heading, one lead line. */
export function PageHeader({ label, lead, children }: { label: string; lead?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="shell page-header">
      <PageCrumbs label={label} />
      <h1>{label}</h1>
      {lead && <p className="lead page-header-lead">{lead}</p>}
      {children}
    </header>
  );
}

/**
 * How much of a collection is still waiting to be checked. One quiet line under the
 * heading rather than a badge on every card — the status matters, but it is not the
 * content.
 */
export function CollectionStatus({ pending, total, showingDemo }: { pending: number; total: number; showingDemo: boolean }) {
  if (showingDemo) {
    return <p className="collection-status">ยังไม่มีข้อมูลภาคสนามในหมวดนี้ · รายการด้านล่างเป็นข้อมูลสาธิตสำหรับทดสอบระบบ</p>;
  }
  if (pending === 0 || total === 0) return null;
  return (
    <p className="collection-status">
      {pending === total ? "ทุกรายการ" : `${pending} จาก ${total} รายการ`}อยู่ระหว่างตรวจสอบร่วมกับช่างและชุมชน ·{" "}
      <Link href="/about#about-status">ความหมายของสถานะ</Link>
    </p>
  );
}
