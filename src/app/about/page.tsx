import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { contactChannel, partners, projectTitle } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "เกี่ยวกับโครงการ",
  description:
    "ที่มา วิธีเก็บข้อมูล สถานะการตรวจสอบ และแนวทางเรื่องสิทธิ์และความยินยอมของคลังองค์ความรู้เรือพระปากพะยูน",
};

/**
 * Who made this, how the information got here, and how to say it is wrong.
 *
 * An archive that presents community knowledge without saying where it came from asks to be
 * trusted on nothing. The status vocabulary is spelled out here because the same words
 * appear as small grey notes throughout the site, where there is no room to explain them.
 */
export default function AboutPage() {
  return (
    <main id="main-content" className="about-page" tabIndex={-1}>
      <header className="shell about-lede">
        <p className="section-index">เกี่ยวกับโครงการ</p>
        <h1>คลังนี้เก็บอะไร<br />และเก็บมาอย่างไร</h1>
        <p className="lead">
          เรือพระเล่าเรื่องคือคลังองค์ความรู้ที่บันทึกงานช่างกระดาษบนเรือพระของอำเภอปากพะยูน
          ทั้งลวดลาย ขั้นตอนการทำงาน วัสดุ เครื่องมือ และคนที่ยังทำงานนี้อยู่
          จุดประสงค์คือให้ความรู้ที่เคยอยู่ในมือช่างและในความทรงจำของชุมชน
          มีที่อยู่ที่ค้นได้ อ้างอิงได้ และแก้ไขให้ถูกต้องได้
        </p>
      </header>

      <section className="shell about-block" aria-labelledby="about-method">
        <h2 id="about-method">วิธีเก็บข้อมูล</h2>
        <div className="about-prose">
          <p>
            เนื้อหาในคลังมาจากการลงพื้นที่จริง ถ่ายภาพและวิดีโอขณะช่างทำงาน
            บันทึกขั้นตอนตามลำดับที่เห็น และจดสิ่งที่ผู้ให้ข้อมูลเล่า
            ไม่ได้เรียบเรียงจากหนังสือหรือจากเว็บไซต์อื่น
          </p>
          <p>
            สิ่งที่ยังไม่ได้บันทึกอย่างเป็นทางการ เราเขียนไว้ตรง ๆ ว่ายังไม่ได้บันทึก
            เช่น ลายที่ยังไม่ทราบชื่อเรียกในพื้นที่จะใช้ชื่อบรรยายลักษณะไปก่อน
            และหน้าช่างที่ยังไม่ได้สัมภาษณ์จะไม่มีคำพูดในเครื่องหมายคำพูด
            เพราะการเติมคำที่ฟังดูเข้าท่าเข้าไปเองคือการแต่งเรื่องให้คนจริง
          </p>
        </div>
      </section>

      <section className="shell about-block" aria-labelledby="about-status">
        <h2 id="about-status">สถานะของข้อมูลแต่ละชิ้น</h2>
        <div className="about-prose">
          <p>
            ทุกหน้าที่ข้อมูลยังไม่ผ่านการตรวจสอบจะมีข้อความกำกับไว้เสมอ
            ความเงียบจะถูกอ่านว่ายืนยันแล้ว เราจึงไม่ปล่อยให้เงียบ
          </p>
        </div>
        <dl className="about-status-list">
          <div>
            <dt>บันทึกภาคสนาม · รอการตรวจสอบ</dt>
            <dd>บันทึกจากพื้นที่จริงแล้ว แต่ยังไม่ได้อ่านทวนร่วมกับช่างและชุมชน</dd>
          </div>
          <div>
            <dt>ตรวจสอบแล้ว</dt>
            <dd>ช่างหรือผู้รู้ในพื้นที่ยืนยันความถูกต้องแล้ว และมีผู้ตรวจสอบกำกับไว้</dd>
          </div>
          <div>
            <dt>ข้อมูลสาธิต</dt>
            <dd>
              ข้อมูลสมมติที่ใช้ทดสอบระบบเท่านั้น ไม่ใช่ข้อเท็จจริงทางวัฒนธรรม
              และจะถูกซ่อนเมื่อมีข้อมูลจริงในหมวดนั้นแล้ว
            </dd>
          </div>
        </dl>
      </section>

      <section className="shell about-block" aria-labelledby="about-rights">
        <h2 id="about-rights">สิทธิ์ ภาพ และความยินยอม</h2>
        <div className="about-prose">
          <p>
            ภาพและวิดีโอทุกชิ้นที่เผยแพร่บนเว็บไซต์นี้ได้รับอนุญาตจากผู้ถ่ายและจากคนที่ปรากฏในภาพแล้ว
            สื่อที่ยังขออนุญาตไม่ครบจะไม่ถูกนำขึ้นเว็บไซต์ แม้จะบันทึกไว้ในระบบแล้วก็ตาม
          </p>
          <p>
            ข้อมูลตำแหน่งที่ติดมากับไฟล์ภาพจะถูกลบทิ้งทุกไฟล์ก่อนนำขึ้นระบบ
            เพราะภาพที่ถ่ายในบ้านหรือในโรงงานช่างมักระบุพิกัดที่อยู่ของคนจริงได้
          </p>
        </div>
      </section>

      <section className="shell about-block" aria-labelledby="about-correction">
        <h2 id="about-correction">พบข้อมูลผิด แจ้งได้</h2>
        <div className="about-prose">
          <p>
            คลังนี้บันทึกความรู้ของชุมชน ชุมชนจึงเป็นผู้ตัดสินว่าอะไรถูก
            หากพบชื่อลาย ลำดับขั้นตอน ชื่อคน หรือรายละเอียดใดที่คลาดเคลื่อน
            การแจ้งกลับมาถือเป็นส่วนหนึ่งของงาน ไม่ใช่การรบกวน
          </p>
          {contactChannel.kind === "email" ? (
            <p>
              ส่งรายละเอียดมาที่ <a className="editorial-link" href={`mailto:${contactChannel.value}`}>{contactChannel.value}</a>
            </p>
          ) : (
            <p>
              ขณะนี้ยังไม่มีช่องทางติดต่อโดยตรงของโครงการ
              ระหว่างนี้แจ้งผ่านหน่วยงานที่ดำเนินการทั้งสองแห่งด้านล่างได้
              และช่องทางติดต่อโดยตรงจะประกาศไว้ในหน้านี้เมื่อพร้อม
            </p>
          )}
        </div>
      </section>

      <section className="shell about-block" aria-labelledby="about-partners">
        <h2 id="about-partners">หน่วยงานที่ดำเนินการ</h2>
        <ul className="about-partners">
          {partners.map((partner) => (
            <li key={partner.name}>
              <strong>{partner.name}</strong>
              <span>{partner.role}</span>
            </li>
          ))}
        </ul>
        <p className="about-project-line">{projectTitle}</p>
      </section>

      <nav className="shell about-back" aria-label="ไปยังส่วนอื่นของคลัง">
        <Link className="editorial-link" href="/craft">
          ดูกระบวนการงานช่างทั้งหมด
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <Link className="editorial-link" href="/">
          กลับหน้าหลัก
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </nav>
    </main>
  );
}
