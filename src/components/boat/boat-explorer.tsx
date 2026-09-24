"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BoatExplorerRecord } from "@/lib/services/boats";

type Section = BoatExplorerRecord["sections"][number];

function uniqueMasters(section: Section, boatMasters: BoatExplorerRecord["masters"]) {
  const entries = [
    ...section.patterns.flatMap(({ pattern }) => pattern.masters.map(({ master }) => master)),
    ...boatMasters.map(({ master }) => master),
  ];
  return [...new Map(entries.map((master) => [master.slug, master])).values()];
}

export function BoatExplorer({ boat }: { boat: BoatExplorerRecord }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeSection = useMemo(
    () => boat.sections.find((section) => section.id === activeId) ?? null,
    [activeId, boat.sections],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeSection && !dialog.open) dialog.showModal();
    if (!activeSection && dialog.open) dialog.close();
  }, [activeSection]);

  const closePanel = () => setActiveId(null);
  const image = boat.coverMedia;

  return (
    <section className="explorer" aria-labelledby="explorer-title">
      <header className="explorer-heading">
        <div>
          <p className="eyebrow">นิทรรศการแบบโต้ตอบ</p>
          <h2 id="explorer-title">อ่านเรือพระ</h2>
        </div>
        <p>เลือกจุดบนเรือเพื่อสำรวจลวดลาย ผู้สร้าง และภูมิปัญญาที่เชื่อมโยงกัน</p>
      </header>

      {image?.url ? (
        <div className="boat-stage" data-loaded={imageLoaded}>
          <div className="image-loading" aria-hidden={imageLoaded}>
            <span /> กำลังเตรียมภาพจัดแสดง
          </div>
          <Image
            className="boat-image"
            src={image.url}
            alt={image.alt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 1200px"
            onLoad={() => setImageLoaded(true)}
          />
          <div className="hotspot-layer" aria-label={`จุดสำรวจ ${boat.sections.length} จุด`}>
            {boat.sections.map((section, index) => (
              <button
                key={section.id}
                className="hotspot"
                style={{ left: `${section.x}%`, top: `${section.y}%` }}
                aria-label={`จุดที่ ${index + 1}: ${section.name}`}
                aria-haspopup="dialog"
                aria-expanded={activeId === section.id}
                data-active={activeId === section.id}
                onClick={() => setActiveId(section.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="boat-image-empty" role="status">
          <ImageIcon aria-hidden="true" />
          <p>ยังไม่มีภาพเรือพระสำหรับการสำรวจ</p>
        </div>
      )}

      {boat.sections.length === 0 && (
        <p className="explorer-empty" role="status">ยังไม่มีจุดสำรวจที่เผยแพร่สำหรับเรือลำนี้</p>
      )}

      <AnimatePresence>
        {activeSection && (
          <motion.dialog
            ref={dialogRef}
            className="exhibit-panel"
            aria-labelledby="panel-title"
            aria-describedby="panel-description"
            onClose={closePanel}
            onCancel={closePanel}
            onClick={(event) => {
              if (event.target === event.currentTarget) closePanel();
            }}
            initial={{ x: 24, y: 18 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: 12, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <article className="panel-inner">
              <header className="panel-header">
                <p className="panel-index">จุดสำรวจ {String(boat.sections.indexOf(activeSection) + 1).padStart(2, "0")}</p>
                <button className="panel-close" type="button" onClick={closePanel} aria-label="ปิดรายละเอียด">
                  <X aria-hidden="true" />
                </button>
              </header>

              {activeSection.closeupMedia?.url && (
                <div className="panel-image">
                  <Image
                    src={activeSection.closeupMedia.url}
                    alt={activeSection.closeupMedia.alt}
                    fill
                    sizes="(max-width: 760px) 100vw, 430px"
                  />
                </div>
              )}

              <h3 id="panel-title">{activeSection.name}</h3>
              <p id="panel-description" className="panel-description">{activeSection.description}</p>

              {activeSection.meaning && (
                <section className="panel-section">
                  <h4>ความหมายและเรื่องเล่า</h4>
                  <p>{activeSection.meaning}</p>
                </section>
              )}

              {activeSection.patterns.length > 0 && (
                <section className="panel-section">
                  <h4>ลวดลายที่พบ</h4>
                  <div className="related-links">
                    {activeSection.patterns.map(({ pattern }) => (
                      <Link key={pattern.slug} href={`/patterns/${pattern.slug}`}>
                        <span>{pattern.localName || pattern.name}</span><ChevronRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {uniqueMasters(activeSection, boat.masters).length > 0 && (
                <section className="panel-section">
                  <h4>ช่างผู้เกี่ยวข้อง</h4>
                  <div className="related-links">
                    {uniqueMasters(activeSection, boat.masters).map((master) => (
                      <Link key={master.slug} href={`/masters/${master.slug}`}>
                        <span>{master.name}</span><ChevronRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {activeSection.patterns.some(({ pattern }) => pattern.steps.length > 0) && (
                <section className="panel-section">
                  <h4>เรียนรู้วิธีสร้าง</h4>
                  <div className="related-links">
                    {activeSection.patterns.flatMap(({ pattern }) => pattern.steps).map(({ step }) => (
                      <Link key={step.slug} href={`/craft/${step.slug}`}>
                        <span>{step.title}</span><ChevronRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </motion.dialog>
        )}
      </AnimatePresence>
    </section>
  );
}
