import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="home-hero home-hero-art" aria-labelledby="hero-title">
      <div className="home-hero-media">
        <Image src="/photos/hero-craft.webp" alt="ภาพประกอบช่างทำลายกระดาษ โดยมีเรือพระสีสดเป็นฉากหลัง" fill priority sizes="100vw" />
      </div>
      <div className="home-hero-veil" aria-hidden="true" />
      <div className="home-hero-inner shell">
        <div className="home-hero-copy">
          <p className="section-index">ปากพะยูน · พัทลุง</p>
          <h1 id="hero-title" className="home-hero-title"><span className="hero-title-art">เรือพระ<svg className="hero-title-flourish" viewBox="0 0 440 44" fill="none" aria-hidden="true"><path d="M4 27C60 3 150 39 248 22S387 7 432 17M276 26C329 17 371 21 393 33C409 42 431 36 429 25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></span><span className="hero-title-place">เล่าเรื่อง</span></h1>
          <p className="home-hero-tagline">
            ต้นแบบการเรียนรู้<br />
            เพื่อสืบสาน<span className="hero-tagline-accent">ภูมิปัญญาปากพะยูน</span>
          </p>
          <div className="home-hero-actions">
            <Link className="button-solid" data-tone="accent" href="#reader">สำรวจเรือพระ<ArrowRight aria-hidden="true" /></Link>
            <Link className="hero-secondary-link" href="/craft">จากกระดาษสู่เรือพระ</Link>
          </div>
        </div>
        <div className="hero-bottom-actions">
          <a className="home-hero-scroll" href="#pillars">เลื่อนเพื่อค้นพบ<ArrowDown aria-hidden="true" /></a>
        </div>
      </div>
      <span className="hero-illustration-label">ภาพประกอบหน้าแรก</span>
    </section>
  );
}
