"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import type { HomeBoat } from "@/lib/services/home";

/**
 * Section 05 — a preview of the boat reader.
 *
 * Hotspots are real buttons, reachable and operable from the keyboard. The panel is not
 * modal: it sits next to the image on a wide screen and rises as a sheet on a narrow one,
 * and it follows the buttons in document order so tabbing stays predictable.
 */
export function BoatReader({ boat }: { boat: HomeBoat | null }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hotspotRefs = useRef(new Map<string, HTMLButtonElement>());

  const close = useCallback(() => {
    const previous = activeId;
    setActiveId(null);
    if (previous) hotspotRefs.current.get(previous)?.focus();
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeId, close]);

  if (!boat) {
    return (
      <section className="home-reader" id="reader" aria-labelledby="reader-title">
        <div className="shell">
          <p className="section-index">04 / อ่านเรือพระ</p>
          <h2 id="reader-title">เรือหนึ่งลำ ประกอบขึ้นจากเรื่องราวมากมาย</h2>
          <p className="empty-note">ยังไม่มีเรือที่บันทึกทั้งภาพและจุดสำรวจไว้ครบ จุดอ่านเรือจะเปิดใช้งานเมื่อข้อมูลพร้อม</p>
        </div>
      </section>
    );
  }

  const active = boat.sections.find((section) => section.id === activeId) ?? null;
  const activeIndex = active ? boat.sections.indexOf(active) : -1;

  return (
    <section className="home-reader" id="reader" aria-labelledby="reader-title">
      <div className="shell home-reader-head">
        <p className="section-index">04 / อ่านเรือพระ</p>
        <h2 id="reader-title">
          เรือหนึ่งลำ
          <br />
          ประกอบขึ้นจากเรื่องราวมากมาย
        </h2>
        <p className="lead">แตะจุดต่าง ๆ บนเรือ เพื่อค้นพบความหมายที่ซ่อนอยู่ในแต่ละส่วน</p>
      </div>

      <div className="shell home-reader-stage-wrap">
        <div className="home-reader-stage">
          <MediaFrame
            image={boat.coverMedia}
            ratio="16/9"
            sizes="(max-width: 63.99rem) 100vw, 1280px"
            className="home-reader-image"
          />
          <div className="home-reader-hotspots">
            {boat.sections.map((section, index) => (
              <button
                key={section.id}
                ref={(node) => {
                  if (node) hotspotRefs.current.set(section.id, node);
                  else hotspotRefs.current.delete(section.id);
                }}
                type="button"
                className="home-hotspot"
                style={{ left: `${section.x}%`, top: `${section.y}%`, animationDelay: `${index * 850}ms` }}
                data-active={section.id === activeId}
                aria-expanded={section.id === activeId}
                aria-controls="reader-panel"
                onClick={() => setActiveId(section.id === activeId ? null : section.id)}
              >
                <span className="home-hotspot-dot" aria-hidden="true" />
                <span className="sr-only">{`จุดที่ ${index + 1}: ${section.name}`}</span>
                <span className="home-hotspot-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </div>

        {active && (
          <div
            id="reader-panel"
            ref={panelRef}
            className="home-reader-panel"
            role="dialog"
            aria-label={`รายละเอียด ${active.name}`}
          >
            <div className="home-reader-panel-head">
              <p className="section-index">{String(activeIndex + 1).padStart(2, "0")} / {active.name}</p>
              <button type="button" className="home-reader-close" onClick={close}>
                <X aria-hidden="true" />
                <span className="sr-only">ปิดรายละเอียด</span>
              </button>
            </div>

            <MediaFrame
              image={active.closeupMedia}
              ratio="16/9"
              sizes="(max-width: 63.99rem) 100vw, 26rem"
              emptyLabel="ภาพระยะใกล้อยู่ระหว่างการบันทึก"
            />

            <p className="home-reader-panel-text">{active.description}</p>
            {active.meaning && <p className="home-reader-panel-meaning">{active.meaning}</p>}

            {active.patterns.length > 0 && (
              <p className="home-reader-panel-patterns">
                <span>ลวดลายที่พบ</span>
                {active.patterns.map(({ pattern }) => pattern.localName || pattern.name).join(" · ")}
              </p>
            )}

            <Link className="editorial-link" href={`/boats/${boat.slug}`}>
              ดูเรือลำนี้
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      <p className="shell home-reader-foot caption">
        {boat.name} · {boat.temple.name} · พ.ศ. {boat.year}
        {boat.isDemo ? " · ข้อมูลสาธิต" : ""}
      </p>
    </section>
  );
}
