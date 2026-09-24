import Link from "next/link";
import { QrCode } from "lucide-react";

/**
 * Segment-level, so a mistyped or withdrawn sticker answers 404 while still explaining
 * itself to whoever is holding the phone.
 */
export default function QrNotFound() {
  return (
    <main id="main-content" className="qr-landing" tabIndex={-1}>
      <div className="shell qr-landing-inner">
        <QrCode className="qr-landing-mark" aria-hidden="true" />
        <p className="eyebrow">404</p>
        <h1>ไม่พบรหัสนี้ในคลัง</h1>
        <p className="lead">
          รหัสอาจพิมพ์ผิด หรือป้ายนี้ถูกยกเลิกไปแล้ว ลองสแกนอีกครั้งให้ตรงกรอบ
          หรือเข้าดูเนื้อหาทั้งหมดได้จากหน้าหลัก
        </p>
        <nav className="qr-landing-actions" aria-label="ไปยังส่วนอื่นของคลัง">
          <Link className="text-action" href="/">กลับหน้าหลัก</Link>
          <Link className="editorial-link" href="/craft">ดูกระบวนการงานช่าง</Link>
        </nav>
      </div>
    </main>
  );
}
