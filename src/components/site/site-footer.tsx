import Image from "next/image";
import Link from "next/link";
import { primaryNav, secondaryNav } from "@/lib/site-nav";
import { projectTitle } from "@/lib/site-info";

const partnerLogos = [
  "Innovative Teacher",
  "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม",
  "กรมส่งเสริมการเรียนรู้",
  "ศูนย์ส่งเสริมการเรียนรู้ระดับอำเภอปากพะยูน สำนักงานส่งเสริมการเรียนรู้ประจำจังหวัดพัทลุง",
  "คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล มหาวิทยาลัยทักษิณ",
  "สถาบันส่งเสริมการบริการวิชาการ มหาวิทยาลัยทักษิณ",
  "รัตนาราม",
];

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
          <div className="site-footer-culture" aria-hidden="true" />
          <p className="site-footer-partners-label">หน่วยงานและโครงการที่ร่วมดำเนินงาน</p>
          <ul>
            {partnerLogos.map((name, index) => (
              <li key={name} title={name}>
                <Image src={index === 3 ? "/partners/pak-phayun-v2.webp" : `/partners/partner-${index + 1}.webp`} alt={name} width={220} height={220} sizes="120px" />
              </li>
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
