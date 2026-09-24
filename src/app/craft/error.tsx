"use client";

export default function CraftError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="craft-page"><div className="craft-empty" role="alert"><h1>เปิดคลังกระบวนการไม่สำเร็จ</h1><button className="text-action" onClick={reset}>ลองอีกครั้ง</button></div></main>;
}
