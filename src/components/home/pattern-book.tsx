"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PageFlip } from "page-flip";
import { MediaFrame } from "@/components/media/media-frame";
import type { HomePattern } from "@/lib/services/home";

export function PatternPreview({ patterns }: { patterns: HomePattern[] }) {
  const host = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLDivElement>(null);
  const engine = useRef<PageFlip | null>(null);
  const gesture = useRef<{x:number;y:number;page:number} | null>(null);
  const swipeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPage = useRef(1);
  useEffect(() => () => { if (swipeTimer.current) clearTimeout(swipeTimer.current); }, []);
  const [page, setPage] = useState(1);
  const [portrait, setPortrait] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    const container = host.current;
    if (!container || !source.current || !patterns.length) return;
    let lastWidth = 0;
    let lastHeight = 0;
    let current = 1;
    let instance: PageFlip | null = null;
    void import("page-flip").then(({ PageFlip }) => {
      if (disposed) return;
      function mount() {
        if (!container || !source.current) return;
        const mobile = container.clientWidth < 600;
        const width = Math.floor(container.clientWidth / (mobile ? 1 : 2));
        setPortrait(mobile);
        const height = Math.round(Math.max(320, Math.min(560, window.innerHeight - 270)));
        if (width === lastWidth && height === lastHeight) return;
        lastWidth = width; lastHeight = height;
        instance?.destroy();
        const book = document.createElement("div");
        container.replaceChildren(book);
        const pages = Array.from(source.current.children).map(node => node.cloneNode(true) as HTMLElement);
        book.append(...pages);
        instance = new PageFlip(book, { width, height, size: "fixed", startPage: current, showCover: true, usePortrait: true, autoSize: false, drawShadow: true, maxShadowOpacity: .45, flippingTime: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 950, useMouseEvents: true, mobileScrollSupport: true, clickEventForward: true, showPageCorners: true, disableFlipByClick: false });
        instance.on("flip", event => { current = Number(event.data); setPage(current); currentPage.current = current; });
        instance.on("changeState", event => setBusy(event.data === "flipping"));
        instance.loadFromHTML(pages);
        engine.current = instance;
      }
      mount();
      observer = new ResizeObserver(mount);
      observer.observe(container);
      window.addEventListener("resize", mount);
      cleanupResize = () => window.removeEventListener("resize", mount);
    });
    let cleanupResize = () => {};
    return () => { disposed = true; observer?.disconnect(); cleanupResize(); instance?.destroy(); engine.current = null; };
  }, [patterns]);
  return <section className="home-patterns ebook-section home-section" id="patterns" aria-labelledby="patterns-title">
    <div className="shell ebook-shell">
      <header className="ebook-heading"><div><p className="section-index">ดูรายละเอียดใกล้ ๆ</p><h2 id="patterns-title">คลังลวดลาย</h2></div><Link href="/patterns">ดูลวดลายทั้งหมด ↗</Link></header>
      <div ref={host} className="ebook-host" onPointerDown={event => { if ((event.target as HTMLElement).closest("a,button")) return; gesture.current={x:event.clientX,y:event.clientY,page:currentPage.current}; }} onPointerUp={event => {
        const start=gesture.current; gesture.current=null;
        if (!start) return;
        const dx=event.clientX-start.x;
        if (Math.abs(dx)<50 || Math.abs(dx)<Math.abs(event.clientY-start.y)) return;
        if (swipeTimer.current) clearTimeout(swipeTimer.current);
        swipeTimer.current=setTimeout(() => { if(currentPage.current===start.page) { if(dx<0) engine.current?.flipNext(); else engine.current?.flipPrev(); } },1000);
      }} onPointerCancel={() => {gesture.current=null;}} aria-label="สมุดภาพลวดลาย" />
      <div ref={source} hidden>
        <div className="ebook-page ebook-cover ebook-cover-art" data-density="hard"><MediaFrame image={{url:"/photos/pattern-book-cover.webp",alt:"ปกหนังสือรวมลวดลายเรือพระ เรือพระเล่าเรื่อง"}} ratio="fill" sizes="(max-width: 600px) 90vw, 560px" priority /></div>
        {patterns.map((pattern, index) => <article className="ebook-page" key={pattern.slug}><div className="ebook-page-content"><div className="ebook-photo"><MediaFrame image={pattern.imageMedia} ratio="fill" sizes="(max-width: 767px) 45vw, 40vw" priority /></div><h3>{pattern.localName || pattern.name}</h3><p className="ebook-description">{pattern.characteristics || "ยังไม่มีคำอธิบายลวดลายในคลัง"}</p><a href={`/patterns/${pattern.slug}`} className="ebook-detail">อ่านรายละเอียด ↗</a><span className="ebook-number">{index + 1}</span></div></article>)}
        {patterns.length % 2 !== 0 && <div className="ebook-page"><div className="ebook-cover-content">จบบันทึกลวดลายในคลัง</div></div>}
        <div className="ebook-page ebook-cover" data-density="hard"><div className="ebook-cover-content"><h3>คลังลวดลาย</h3><p>เรือพระปากพะยูน</p></div></div>
      </div>
      <nav onPointerDown={() => { if(swipeTimer.current) clearTimeout(swipeTimer.current); }} onKeyDown={() => { if(swipeTimer.current) clearTimeout(swipeTimer.current); }} className="ebook-controls" aria-label="พลิกหน้าสมุดลวดลาย"><button disabled={page === 0 || busy} onClick={() => engine.current?.flipPrev()}>ก่อนหน้า</button><span aria-live="polite">{page === 0 ? "หน้าปก" : page > patterns.length ? "ปกหลัง" : portrait ? `หน้า ${page} / ${patterns.length}` : `หน้า ${page}–${Math.min(page + 1, patterns.length)} / ${patterns.length}`}</span><button disabled={busy} onClick={() => engine.current?.flip(0)}>ปิดหน้าปก</button><button disabled={page > patterns.length || busy} onClick={() => engine.current?.flipNext()}>{page === 0 ? "เปิดสมุด" : "ถัดไป"}</button></nav>
      <p className="ebook-hint">ลากกลางหน้าหรือมุมกระดาษซ้าย–ขวาเพื่อพลิก · ใช้ปุ่มก่อนหน้า–ถัดไปได้เช่นกัน</p>
    </div>
  </section>;
}

