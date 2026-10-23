"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import type { HomeImage } from "@/lib/services/home";

export function CultureGallery({ images }: { images: HomeImage[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [explicitPlay, setExplicitPlay] = useState(false);
  const root = useRef<HTMLElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .15), { threshold: [0, .15, .35] });
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); preference.removeEventListener("change", update); };
  }, []);
  useEffect(() => {
    if (paused || (reduced && !explicitPlay) || !visible || images.length < 2) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex(value => (value + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused, reduced, explicitPlay, visible, images.length]);
  function choose(value: number) {
    setPaused(true);
    setIndex((value + images.length) % images.length);
  }
  return (
    <section ref={root} className="culture-gallery" aria-labelledby="culture-title" aria-roledescription="สไลด์ภาพ"
      onFocusCapture={event => { if (!(event.target as HTMLElement).closest(".culture-play")) setPaused(true); }}>
      <div className="culture-heading shell"><p className="section-index">ภาพเล่าเรื่อง</p><h2 id="culture-title"><span className="culture-title-art">สีสัน<span>เรือพระ</span></span>{" "}<span className="culture-title-place">วิถีปากพะยูน</span></h2><p>สัมผัสศิลปะ วิถีผู้คน และวัฒนธรรมเรือพระปากพะยูน</p></div>
      {images.length ? <>
        <div className="culture-stage" onTouchStart={event => { const touch = event.touches[0]; start.current = { x: touch.clientX, y: touch.clientY }; }}
          onTouchEnd={event => { const touch = event.changedTouches[0]; if (start.current) { const dx = touch.clientX - start.current.x; const dy = touch.clientY - start.current.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) choose(index + (dx < 0 ? 1 : -1)); } start.current = null; }}>
          {images.map((image, position) => <div key={image.url} className="culture-slide" data-active={position === index} aria-hidden={position !== index}>
            <MediaFrame image={image} ratio="fill" sizes="100vw" priority={visible && (position === index || position === (index + 1) % images.length)} />
          </div>)}
          {images.length > 1 && <div className="culture-arrows"><button type="button" aria-label="ภาพก่อนหน้า" onClick={() => choose(index - 1)}><ChevronLeft aria-hidden="true" /></button><button type="button" aria-label="ภาพถัดไป" onClick={() => choose(index + 1)}><ChevronRight aria-hidden="true" /></button></div>}
        </div>
        <div className="culture-caption shell" aria-live={paused || reduced ? "polite" : "off"}>
          <div><p className="culture-counter">{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</p><p>{images[index].alt}</p>{images[index].credit && <small>ภาพ: {images[index].credit}</small>}</div>
          {images.length > 1 && <button type="button" className="culture-play" aria-label={paused || (reduced && !explicitPlay) ? "เล่นภาพอัตโนมัติ" : "พักภาพอัตโนมัติ"} aria-pressed={!paused && (!reduced || explicitPlay)} onClick={() => { if (reduced && !explicitPlay) { setExplicitPlay(true); setPaused(false); } else setPaused(value => !value); }}>{paused || (reduced && !explicitPlay) ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}<span>{paused || (reduced && !explicitPlay) ? "เล่นภาพ" : "พักภาพ"}</span></button>}
        </div>
        {images.length > 1 && <ul className="culture-thumbnails shell" aria-label="เลือกภาพ">{images.map((image, position) => <li key={image.url}><button type="button" aria-label={`ดูภาพที่ ${position + 1}: ${image.alt}`} aria-pressed={position === index} onClick={() => choose(position)}><MediaFrame image={image} ratio="3/2" sizes="120px" decorative /></button></li>)}</ul>}
      </> : <p className="shell empty-note">กำลังรวบรวมภาพสำหรับส่วนนี้</p>}
    </section>
  );
}

