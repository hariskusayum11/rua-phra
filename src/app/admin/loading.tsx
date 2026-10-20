export default function Loading() {
  return (
    <main id="main-content" className="page-shell" tabIndex={-1} aria-busy="true">
      <h1 className="sr-only">กำลังโหลด</h1>
      <p role="status">กำลังโหลดเนื้อหา…</p>
    </main>
  );
}
