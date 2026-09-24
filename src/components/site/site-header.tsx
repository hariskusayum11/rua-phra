"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { primaryNav, secondaryNav } from "@/lib/site-nav";

/**
 * The header sits over the cinematic hero in ivory-on-photograph, then becomes a solid
 * ivory bar once the reader has left the hero. Pages without a hero start solid.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
      if (event.key !== "Tab") return;
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, closeMenu]);

  const solid = !overHero || scrolled;

  return (
    <>
      <header className="site-header" data-solid={solid}>
        <div className="header-inner shell">
          <Link className="wordmark" href="/" aria-label="เรือพระเล่าเรื่อง — หน้าหลัก">
            เรือพระเล่าเรื่อง
            <small lang="en">PAK PHAYUN CULTURAL ARCHIVE</small>
          </Link>

          <nav className="header-nav" aria-label="เมนูหลัก">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>

          <button
            ref={toggleRef}
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
          >
            <Menu aria-hidden="true" />
            <span className="sr-only">เปิดเมนูทั้งหมด</span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="site-menu" ref={menuRef} role="dialog" aria-modal="true" aria-label="เมนูทั้งหมด">
          <div className="site-menu-top header-inner shell">
            <span className="wordmark" aria-hidden="true">
              เรือพระเล่าเรื่อง
              <small lang="en">PAK PHAYUN CULTURAL ARCHIVE</small>
            </span>
            <button className="menu-toggle" type="button" onClick={closeMenu}>
              <X aria-hidden="true" />
              <span className="sr-only">ปิดเมนู</span>
            </button>
          </div>
          <div className="site-menu-body shell">
            <div className="site-menu-group">
              <p>สำรวจ</p>
              {primaryNav.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMenu}>
                  {item.label}
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              ))}
            </div>
            <div className="site-menu-group">
              <p>เพิ่มเติม</p>
              {secondaryNav.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMenu}>
                  {item.label}
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              ))}
            </div>
            <p className="site-menu-foot">ทุกลายมีเรื่อง ทุกเรื่องมีคนส่งต่อ</p>
          </div>
        </div>
      )}
    </>
  );
}
