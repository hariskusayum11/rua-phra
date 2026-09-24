import Link from "next/link";
import { headers } from "next/headers";
import QRCodeLib from "qrcode";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { getQrCodeSheet } from "@/lib/services/qr";

export const dynamic = "force-dynamic";

export const metadata = { title: "พิมพ์ป้าย QR" };

const targetLabels: Record<string, string> = {
  BOAT: "เรือพระ", PATTERN: "ลวดลาย", MASTER: "ช่าง", PROCESS: "กระบวนการ", STEP: "ขั้นตอน", LESSON: "บทเรียน",
};

/**
 * Works out which address the printed sticker should point at.
 *
 * Preference goes to an explicitly configured site URL, because the person printing may be
 * doing it from a laptop on the office network while the site itself lives elsewhere. The
 * request host is only a fallback, and a localhost result is surfaced rather than silently
 * baked into a hundred stickers.
 */
async function resolveBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return { base: configured.replace(/\/+$/, ""), source: "ตั้งค่าไว้ใน NEXT_PUBLIC_SITE_URL" };
  const head = await headers();
  const host = head.get("x-forwarded-host") ?? head.get("host") ?? "localhost:3000";
  const proto = head.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return { base: `${proto}://${host}`, source: "เดาจากที่อยู่ที่เปิดหน้านี้" };
}

export default async function QrPrintPage() {
  const [codes, { base, source }] = await Promise.all([getQrCodeSheet(), resolveBaseUrl()]);
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/.test(base);

  const cards = await Promise.all(
    codes.filter((row) => row.active).map(async (row) => ({
      ...row,
      url: `${base}/q/${row.code}`,
      // Error correction level M survives a sticker that has been rained on and peeled at
      // one corner, without making the modules so fine they blur on a cheap printer.
      svg: await QRCodeLib.toString(`${base}/q/${row.code}`, {
        type: "svg", errorCorrectionLevel: "M", margin: 1, width: 240,
      }),
    })),
  );

  const retired = codes.filter((row) => !row.active);

  return (
    <main className="admin-main qr-print" id="main-content" tabIndex={-1}>
      <div className="qr-print-controls">
        <Link className="editorial-link" href="/admin/qr-codes">
          <ArrowLeft aria-hidden="true" />
          กลับไปจัดการ QR Code
        </Link>
        <h1>ป้าย QR สำหรับติดหน้างาน</h1>
        <p>
          ป้ายทั้งหมดชี้ไปที่ <code>{base}/q/…</code> ({source})
          {" "}สั่งพิมพ์จากเบราว์เซอร์ได้เลย เมนูด้านข้างจะไม่ติดไปกับกระดาษ
        </p>

        {isLocal && (
          <p className="qr-print-warning" role="alert">
            <TriangleAlert aria-hidden="true" />
            <span>
              ที่อยู่นี้เป็น <strong>localhost</strong> ซึ่งใช้ได้เฉพาะบนเครื่องนี้เท่านั้น
              ป้ายที่พิมพ์ออกไปจะสแกนไม่ได้ที่วัด ตั้งค่า <code>NEXT_PUBLIC_SITE_URL</code>
              เป็นที่อยู่จริงของเว็บไซต์ก่อนสั่งพิมพ์
            </span>
          </p>
        )}

        {retired.length > 0 && (
          <p className="qr-print-note">
            ไม่พิมพ์ป้ายที่ปิดใช้งานแล้ว {retired.length} รายการ · {retired.map((row) => row.label).join(" · ")}
          </p>
        )}
      </div>

      {cards.length === 0 ? (
        <p className="admin-empty">ยังไม่มี QR Code ที่เปิดใช้งาน สร้างได้จากหน้าจัดการ QR Code</p>
      ) : (
        <ul className="qr-print-sheet">
          {cards.map((card) => (
            <li key={card.id} className="qr-print-card">
              {/* qrcode renders its own SVG string; there is no user input inside it — the
                  content is the URL this page just built. */}
              <div className="qr-print-image" aria-hidden="true" dangerouslySetInnerHTML={{ __html: card.svg }} />
              <p className="qr-print-label">{card.label}</p>
              {card.target && <p className="qr-print-target">{targetLabels[card.targetKind] ?? card.targetKind} · {card.target}</p>}
              <p className="qr-print-url">{base.replace(/^https?:\/\//, "")}/q/<strong>{card.code}</strong></p>
              <p className="qr-print-scans">สแกนแล้ว {card.scanCount} ครั้ง</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
