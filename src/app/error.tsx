"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="page-shell" tabIndex={-1}>
      <div role="alert">
        <h1>ไม่สามารถแสดงหน้านี้ได้</h1>
        <p className="lead">เกิดข้อผิดพลาดระหว่างโหลด กรุณาลองอีกครั้ง</p>
      </div>
      <button className="text-action" onClick={reset}>ลองอีกครั้ง</button>
    </main>
  );
}
