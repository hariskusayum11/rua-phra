import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QrCode } from "lucide-react";
import { recordScan, resolveQrCode } from "@/lib/services/qr";

/** Scans are counted and codes can be retired at any time, so nothing here may be cached. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "กำลังพาไปยังเนื้อหา",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

/**
 * Where a scanned sticker lands.
 *
 * The visitor is standing in front of the boat with a phone, so every outcome short of a
 * redirect has to say something useful in Thai rather than showing a bare error. The one
 * exception is an unknown code, which is genuinely a 404 and says so with the right status.
 */
export default async function QrLandingPage({ params }: Props) {
  const { code } = await params;
  const result = await resolveQrCode(code);

  if (result.kind === "unknown") notFound();

  if (result.kind === "redirect") {
    await recordScan(result.id);
    redirect(result.href); // Throws NEXT_REDIRECT — must stay outside any try block.
  }

  const message =
    result.kind === "inactive"
      ? "ป้ายนี้ถูกปิดใช้งานแล้ว อาจเป็นเพราะเนื้อหาถูกย้ายหรืออยู่ระหว่างปรับปรุง"
      : "ปลายทางของป้ายนี้ยังไม่ได้เผยแพร่ ทีมงานบันทึกไว้แล้วและกำลังจัดทำอยู่";

  return (
    <main id="main-content" className="qr-landing" tabIndex={-1}>
      <div className="shell qr-landing-inner">
        <QrCode className="qr-landing-mark" aria-hidden="true" />
        <p className="eyebrow">รหัส {code}</p>
        <h1>{result.label}</h1>
        <p className="lead">{message}</p>
        <nav className="qr-landing-actions" aria-label="ไปยังส่วนอื่นของคลัง">
          <Link className="text-action" href="/">กลับหน้าหลัก</Link>
          <Link className="editorial-link" href="/craft">ดูกระบวนการงานช่าง</Link>
        </nav>
      </div>
    </main>
  );
}
