import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <p className="eyebrow">404</p>
      <h1>ไม่พบหน้าที่ต้องการ</h1>
      <p className="lead">หน้านี้อาจยังไม่ได้เผยแพร่ หรือที่อยู่อาจไม่ถูกต้อง</p>
      <Link className="text-action" href="/">กลับหน้าหลัก</Link>
    </main>
  );
}
