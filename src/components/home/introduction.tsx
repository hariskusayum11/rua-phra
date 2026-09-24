import { Reveal } from "@/components/motion/reveal";

/**
 * Four words, set at display size and staggered across the width rather than lined up in
 * columns. A four-column row reads as a feature grid; these are meant to read as four
 * things a reader is about to meet.
 */
const pillars = [
  { word: "ศิลปะ", lane: "start" },
  { word: "ศรัทธา", lane: "mid" },
  { word: "เรื่องเล่า", lane: "wide" },
  { word: "ภูมิปัญญา", lane: "end" },
];

/** Section 02 — the quiet breath after the hero: type, air, and four words. */
export function Introduction() {
  return (
    <section className="home-introduction" id="introduction" aria-labelledby="introduction-title">
      <div className="shell home-introduction-inner">
        <Reveal className="home-introduction-index">
          <p className="section-index">01 / รู้จักเรือพระ</p>
        </Reveal>

        <div className="home-introduction-body">
          <Reveal>
            <h2 id="introduction-title">
              เรือพระปากพะยูน
              <br />
              มากกว่าความงาม
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="lead home-introduction-lead">
              เรือแต่ละลำเกิดจากการทำงานร่วมกันของคนทั้งชุมชน
              สิ่งที่มองเห็นเป็นเพียงปลายทางของความรู้ที่ส่งต่อกันมาหลายรุ่น
            </p>
          </Reveal>
        </div>
      </div>

      <div className="shell">
        <ul className="home-pillars">
          {pillars.map((pillar, index) => (
            <Reveal as="li" key={pillar.word} delay={index * 130} data-lane={pillar.lane}>
              <span>{pillar.word}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
