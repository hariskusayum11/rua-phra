import Link from "next/link";
import { primaryNav, secondaryNav } from "@/lib/site-nav";
import { partners, projectTitle } from "@/lib/site-info";

/**
 * The partner organisations are named in text, from the same source the about page reads,
 * so the two can never drift apart. Logos belong here too once the official files arrive —
 * never in the hero, where they would compete with the photograph.
 */

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <strong>เรือพระเล่าเรื่อง</strong>
            <p>ทุกลายมีเรื่อง ทุกเรื่องมีคนส่งต่อ</p>
          </div>
          <nav aria-label="เมนูส่วนท้าย — สำรวจ">
            <p>สำรวจ</p>
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
          <nav aria-label="เมนูส่วนท้าย — เพิ่มเติม">
            <p>เพิ่มเติม</p>
            {secondaryNav.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
        </div>

        <div className="site-footer-partners">
          <p className="site-footer-partners-label">ดำเนินการโดย</p>
          <ul>
            {partners.map((partner) => (
              <li key={partner.name}>{partner.name}</li>
            ))}
          </ul>
        </div>

        <div className="site-footer-legal">
          <p>{projectTitle}</p>
          <p>
            ภาพและวิดีโอบันทึกจากพื้นที่จริง เนื้อหาบางส่วนยังรอการตรวจสอบร่วมกับช่างและชุมชน
            ส่วนที่ยังไม่ผ่านการตรวจสอบจะมีข้อความกำกับไว้ในแต่ละหน้า
          </p>
        </div>
      </div>
    </footer>
  );
}
