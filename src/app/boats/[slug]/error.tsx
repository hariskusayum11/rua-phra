"use client";

export default function BoatError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="boat-page">
      <div className="boat-loading" role="alert">
        <h1>ไม่สามารถเปิดนิทรรศการได้</h1>
        <p>กรุณาลองโหลดข้อมูลเรือพระอีกครั้ง</p>
        <button className="text-action" onClick={reset}>ลองอีกครั้ง</button>
      </div>
    </main>
  );
}
