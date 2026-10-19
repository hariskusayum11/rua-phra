import { Reveal } from "@/components/motion/reveal";
export function Introduction() {
  return <section className="home-introduction" id="introduction" aria-labelledby="introduction-title">
    <div className="shell home-introduction-inner">
      <p className="section-index">รู้จักเรือพระ</p>
      <Reveal className="home-introduction-body">
        <h2 id="introduction-title">เรือพระปากพะยูน</h2>
        <p className="lead home-introduction-lead">ชมภาพเรือพระจากวัดในอำเภอปากพะยูน เลือกดูส่วนประกอบและลายกระดาษระยะใกล้ แล้วตามไปดูขั้นตอนงานช่างที่บันทึกไว้</p>
      </Reveal>
    </div>
  </section>;
}
