import Link from "next/link";
import { connection } from "next/server";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { bucketUsage } from "@/lib/object-store";
import { FREE_TIER_BYTES, objectStore } from "@/lib/media-storage";

export const metadata = { title: "พื้นที่เก็บไฟล์" };

function gb(bytes: number) {
  return bytes / 1024 ** 3;
}

function human(bytes: number) {
  if (bytes >= 1024 ** 3) return `${gb(bytes).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/**
 * How much of the free storage allowance is in use, and how much room is left.
 *
 * Exists because the project has no budget and the object store bills for overage rather
 * than stopping. The site's own ceiling sits below the free allowance and uploads are
 * refused at it, so this page is the place to see that coming rather than the first place
 * anyone hears about it being an invoice.
 */
export default async function StoragePage() {
  await connection();
  const configured = objectStore();
  const usage = await bucketUsage({ fresh: true });

  if (configured && !usage) {
    return (
      <main className="admin-main" id="main-content" tabIndex={-1}>
        <header className="admin-page-head">
          <div>
            <p className="admin-kicker">Storage</p>
            <h1>พื้นที่เก็บไฟล์</h1>
          </div>
        </header>
        <div className="admin-empty" role="alert">
          <h2>อ่านปริมาณการใช้งานไม่ได้</h2>
          <p>ตั้งค่าที่เก็บไฟล์ไว้แล้ว แต่ติดต่อไม่ได้ อาจเป็นเพราะค่าที่ตั้งไม่ถูกต้องหรือเครือข่ายขัดข้อง</p>
          <p>ระหว่างนี้ระบบจะไม่รับไฟล์อัปโหลดใหม่ เพื่อไม่ให้เขียนไฟล์ลงไปโดยไม่รู้ว่าเหลือพื้นที่เท่าไร</p>
        </div>
      </main>
    );
  }

  if (!configured || !usage) {
    return (
      <main className="admin-main" id="main-content" tabIndex={-1}>
        <header className="admin-page-head">
          <div>
            <p className="admin-kicker">Storage</p>
            <h1>พื้นที่เก็บไฟล์</h1>
          </div>
        </header>
        <div className="admin-empty">
          <h2>เก็บไฟล์ไว้ในเครื่องนี้</h2>
          <p>ยังไม่ได้ตั้งค่าที่เก็บไฟล์ภายนอก ภาพที่อัปโหลดจึงเก็บไว้ในโฟลเดอร์ของเซิร์ฟเวอร์</p>
          <p>หน้านี้จะแสดงปริมาณการใช้งานเมื่อตั้งค่า Cloudflare R2 ครบทุกค่าแล้ว</p>
        </div>
      </main>
    );
  }

  const percentOfCeiling = (usage.bytes / usage.limitBytes) * 100;
  const percentOfFree = (usage.bytes / FREE_TIER_BYTES) * 100;
  const remaining = Math.max(0, usage.limitBytes - usage.bytes);
  const level = percentOfCeiling >= 90 ? "danger" : percentOfCeiling >= 70 ? "warn" : "ok";

  return (
    <main className="admin-main" id="main-content" tabIndex={-1}>
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Storage</p>
          <h1>พื้นที่เก็บไฟล์</h1>
          <p>{usage.objects} ไฟล์ · อ่านค่าเมื่อ {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(usage.measuredAt)}</p>
        </div>
      </header>

      <section className="storage-card" data-level={level}>
        <p className="storage-status">
          {level === "ok" ? <CheckCircle2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
          {level === "ok"
            ? "อยู่ในโควตาฟรี ไม่มีค่าใช้จ่าย"
            : level === "warn"
              ? "ใช้ไปเกินครึ่งของเพดานที่ตั้งไว้แล้ว"
              : "ใกล้เต็มเพดาน ระบบจะหยุดรับไฟล์ใหม่"}
        </p>

        <p className="storage-figure">
          {human(usage.bytes)}
          <span>จากเพดาน {gb(usage.limitBytes).toFixed(0)} GB</span>
        </p>

        <div
          className="storage-bar"
          role="progressbar"
          aria-valuenow={Math.round(percentOfCeiling)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`ใช้ไป ${percentOfCeiling.toFixed(1)} เปอร์เซ็นต์ของเพดาน`}
        >
          <span style={{ inlineSize: `${Math.min(100, Math.max(0.5, percentOfCeiling))}%` }} />
        </div>

        <dl className="storage-facts">
          <div>
            <dt>ใช้ไป</dt>
            <dd>{percentOfCeiling.toFixed(percentOfCeiling < 1 ? 2 : 1)}% ของเพดาน</dd>
          </div>
          <div>
            <dt>เทียบกับโควตาฟรี 10 GB</dt>
            <dd>{percentOfFree.toFixed(percentOfFree < 1 ? 2 : 1)}%</dd>
          </div>
          <div>
            <dt>เหลือใส่ได้อีก</dt>
            <dd>{human(remaining)}</dd>
          </div>
          <div>
            <dt>ภาพขนาดปกติใส่ได้อีกราว</dt>
            <dd>{Math.floor(remaining / (400 * 1024)).toLocaleString("th-TH")} ใบ</dd>
          </div>
        </dl>
      </section>

      <section className="storage-notes">
        <h2>ระบบกันไม่ให้เสียเงินอย่างไร</h2>
        <ul>
          <li>
            <strong>เพดานอยู่ต่ำกว่าโควตาฟรี</strong> ตั้งไว้ที่ {gb(usage.limitBytes).toFixed(0)} GB
            ขณะที่ Cloudflare ให้ฟรี 10 GB ช่องว่างตรงนี้คือกันชน
          </li>
          <li>
            <strong>ถึงเพดานแล้วหยุดรับไฟล์</strong> การอัปโหลดจะถูกปฏิเสธพร้อมข้อความอธิบาย
            ไม่ใช่เขียนลงไปแล้วค่อยรู้ตอนได้ใบแจ้งหนี้
          </li>
          <li>
            <strong>ค่าส่งข้อมูลออกไม่มีค่าใช้จ่าย</strong> คนเข้าดูเว็บมากแค่ไหนก็ไม่เสียเงิน
            สิ่งที่คิดเงินคือพื้นที่เก็บเท่านั้น
          </li>
          <li>
            ปรับเพดานได้ที่ตัวแปร <code>R2_MAX_BYTES</code> ถ้าจำเป็น
          </li>
        </ul>
        <p className="storage-footnote">
          ตั้งการแจ้งเตือนเพิ่มได้ที่หน้า Cloudflare → Notifications เลือก R2 แล้วกำหนดเกณฑ์
          ระบบจะอีเมลมาเตือนก่อนถึงโควตา
        </p>
        <Link className="editorial-link" href="/admin/media">ไปที่คลังภาพและสื่อ</Link>
      </section>
    </main>
  );
}
