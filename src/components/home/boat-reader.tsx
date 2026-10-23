"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import type { HomeBoat } from "@/lib/services/home";

export function BoatReader({ boats, total }: { boats: HomeBoat[]; total: number }) {
  const [boatIndex, setBoatIndex] = useState(0);
  const boat = boats[boatIndex] ?? null;
  function selectBoat(index: number) { setActiveId(null); setBoatIndex(index); }
  const [activeId, setActiveId] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const active = boat?.sections.find(section => section.id === activeId) ?? null;

  useEffect(() => {
    if (!active || !dialogRef.current) return;
    dialogRef.current.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [active]);

  function open(id: string, button: HTMLButtonElement) {
    openerRef.current = button;
    stageRef.current?.closest("section")?.scrollIntoView({ block: "start", behavior: "instant" });
    setActiveId(id);
  }

  return (
    <section className="home-reader reader-exhibit on-dark home-section" id="reader" aria-labelledby="reader-title">
      <div className="shell reader-exhibit-inner">
        <div className="home-section-heading-row">
          <div className="home-section-head"><p className="section-index">เรื่องเล่าเรือพระ</p><h2 id="reader-title">เรือหนึ่งลำ หนึ่งเรื่องราว</h2><p>เลือกส่วนประกอบเพื่อดูภาพระยะใกล้ แล้วอ่านรายละเอียดต่อในหน้าเรือ</p></div>
          <Link className="editorial-link" href="/boats">ดูเรือทั้งหมด{total > 0 ? ` ${total} ลำ` : ""}<ArrowUpRight aria-hidden="true" /></Link>
        </div>
        {boat ? <>
          <div className="reader-gallery">
          <MediaFrame image={boat.coverMedia} ratio="fill" sizes="100vw" decorative className="reader-full-background" />
          {boats.length > 1 && <div className="reader-navigation"><button type="button" aria-label="เรือก่อนหน้า" onClick={() => selectBoat((boatIndex - 1 + boats.length) % boats.length)}><ChevronLeft aria-hidden="true" /></button><span aria-live="polite">{boatIndex + 1} / {boats.length}</span><button type="button" aria-label="เรือถัดไป" onClick={() => selectBoat((boatIndex + 1) % boats.length)}><ChevronRight aria-hidden="true" /></button></div>}
          <div ref={stageRef} className="home-reader-stage" data-zoomed={!!active}>
          <div className="reader-zoom-plane" style={{ transformOrigin: active ? `${active.x}% ${active.y}%` : "50% 50%", transform: active ? "scale(1.85)" : "scale(1)" }}>
          <div className="reader-photo-plane" style={{ aspectRatio: boat.coverMedia?.width && boat.coverMedia?.height ? `${boat.coverMedia.width}/${boat.coverMedia.height}` : "16/9" }}>
            <MediaFrame image={boat.coverMedia} ratio="fill" sizes="100vw" className="home-reader-image" />
            <div className="home-reader-hotspots">{boat.sections.map((section, index) => (
              <div key={section.id} className="home-hotspot-position" style={{ left: `${section.x}%`, top: `${section.y}%` }}>
                <span className="home-hotspot-marker" aria-hidden="true">{index + 1}</span>
                <button type="button" className="home-hotspot" data-active={section.id === activeId} aria-label={`จุดที่ ${index + 1}: ${section.name}`} aria-haspopup="dialog" aria-expanded={section.id === activeId} onClick={event => open(section.id, event.currentTarget)}><span>{index + 1}</span></button>
              </div>
            ))}</div>
          </div>
          </div></div></div>
          <div className="reader-overlay-info"><div className="home-reader-caption"><h3>{boat.name} · พ.ศ. {boat.year}</h3><Link className="editorial-link" href={`/boats/${boat.slug}`}>ดูรายละเอียดเรือลำนี้<ArrowRight aria-hidden="true" /></Link></div>
          {boat.summary && <p className="reader-boat-summary">{boat.summary}</p>}
          </div>
        </> : <p className="empty-note">ยังไม่มีเรือที่บันทึกภาพและจุดสำรวจไว้พร้อมแสดง</p>}
      </div>
      {active && boat && <dialog ref={dialogRef} className="home-reader-panel reader-exhibit-panel" aria-labelledby="reader-panel-title"
        onCancel={event => { event.preventDefault(); setActiveId(null); }}
        onClose={() => setActiveId(null)}
        onClick={event => { if (event.target === event.currentTarget) setActiveId(null); }}
        onKeyDown={event => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}>
        <div className="home-reader-panel-head"><p className="section-index">ส่วนประกอบเรือพระ</p><button type="button" className="home-reader-close" onClick={() => setActiveId(null)} aria-label="ปิดรายละเอียด" autoFocus><X aria-hidden="true" /></button></div>
        <MediaFrame image={active.closeupMedia} ratio="16/9" sizes="(max-width: 767px) 100vw, 460px" emptyLabel="ยังไม่มีภาพระยะใกล้ของส่วนนี้" />
        <h3 id="reader-panel-title">{active.name}</h3>
        <p className="caption">{active.verification?.status === "VERIFIED" || active.verification?.status === "PUBLISHED" ? "ตรวจสอบแล้ว" : "บันทึกภาคสนาม · รอการตรวจสอบร่วมกับช่าง"}</p>
        <p className="home-reader-panel-text">{active.description}</p>
        {active.meaning && <p className="home-reader-panel-text">{active.meaning}</p>}
        {active.patterns.length > 0 && <div className="home-reader-panel-patterns"><p>ลวดลายที่เกี่ยวข้อง</p>{active.patterns.map(({ pattern }) => <Link key={pattern.slug} href={`/patterns/${pattern.slug}`}>{pattern.localName || pattern.name}<ArrowUpRight aria-hidden="true" /></Link>)}</div>}
        <Link className="editorial-link" href={`/boats/${boat.slug}`}>ดูรายละเอียดเรือลำนี้<ArrowRight aria-hidden="true" /></Link>
      </dialog>}
    </section>
  );
}
