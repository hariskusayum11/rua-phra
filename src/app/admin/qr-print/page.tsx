import Link from "next/link";
import { headers } from "next/headers";
import QRCodeLib from "qrcode";
import { ArrowLeft, LayoutGrid, Maximize2, TriangleAlert } from "lucide-react";
import { getQrCodeSheet } from "@/lib/services/qr";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";

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

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function QrPrintPage({ searchParams }: Props) {
  // A sticker sheet and a board sign are different objects. One gets cut into squares and
  // glued to a boat; the other is one large code read from a metre away in an exhibition
  // hall, and printing it at sticker size would make it unscannable from standing distance.
  const poster = (await searchParams).size === "poster";
  const [codes, { base, source }] = await Promise.all([getQrCodeSheet(), resolveBaseUrl()]);
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/.test(base);

  const cards = await Promise.all(
    codes.filter((row) => row.active).map(async (row) => ({
      ...row,
      url: `${base}/q/${row.code}`,
      // Error correction level M survives a sticker that has been rained on and peeled at
      // one corner, without making the modules so fine they blur on a cheap printer.
      svg: await QRCodeLib.toString(`${base}/q/${row.code}`, {
        type: "svg", errorCorrectionLevel: "M", margin: 1, width: poster ? 900 : 240,
      }),
    })),
  );

  const retired = codes.filter((row) => !row.active);

  return (
    <main className="admin-main qr-print" id="main-content" tabIndex={-1} data-poster={poster || undefined}>
      <AdminBreadcrumb crumbs={[{ href: "/admin", label: "ภาพรวม" }, { href: "/admin/qr-codes", label: "QR Codes" }, { label: "พิมพ์ป้าย" }]} />
      <div className="qr-print-controls">
        <Link className="editorial-link" href="/admin/qr-codes">
          <ArrowLeft aria-hidden="true" />
          กลับไปจัดการ QR Code
        </Link>
        <h1>{poster ? "ป้าย QR ขนาดใหญ่สำหรับบอร์ดนิทรรศการ" : "ป้าย QR สำหรับติดหน้างาน"}</h1>
        <p className="qr-print-modes">
          {poster ? (
            <Link className="editorial-link" href="/admin/qr-print">
              <LayoutGrid aria-hidden="true" />
              สลับไปแบบสติกเกอร์ หลายดวงต่อหน้า
            </Link>
          ) : (
            <Link className="editorial-link" href="/admin/qr-print?size=poster">
              <Maximize2 aria-hidden="true" />
              สลับไปแบบใหญ่ หน้าละหนึ่งดวง สำหรับบอร์ดนิทรรศการ
            </Link>
          )}
        </p>
        <p>
          ป้ายทั้งหมดชี้ไปที่ <code>{base}/q/…</code> ({source})
          {" "}สั่งพิมพ์จากเบราว์เซอร์ได้เลย เมนูด้านข้างจะไม่ติดไปกับกระดาษ
          {poster && " แบบใหญ่จะได้หน้าละหนึ่งดวง ประมาณ 12 เซนติเมตร สแกนได้จากระยะยืน"}
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
