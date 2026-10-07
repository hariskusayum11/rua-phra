import { connection } from "next/server";
import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { BackNav } from "@/components/site/back-nav";
import { getCompetitionArchive } from "@/lib/services/competition";

export const metadata: Metadata = {
  title: "ผลการประกวดเรือพระ ปากพะยูน",
  description:
    "ผลการประกวดเรือพระในงานลากพระอำเภอปากพะยูน ตั้งแต่ปีแรกที่ชิงถ้วยพระราชทาน พ.ศ. 2556 ถึง พ.ศ. 2568",
};

const RANK_LABEL: Record<number, string> = { 1: "ที่ 1", 2: "ที่ 2", 3: "ที่ 3", 4: "ที่ 4" };

function rankLabel(rank: number) {
  return RANK_LABEL[rank] ?? `ที่ ${rank}`;
}

/**
 * Thirteen years of the competition, in one place.
 *
 * The site documents one boat from one temple in detail. This page is what puts that boat
 * in a field: วัดรัตนาราม is not simply a temple the team happened to visit, it is the
 * temple with the most placings in the period, and a reader can see that here rather than
 * being told it.
 *
 * Rendered per request like the rest of the archive, so a production image can be built
 * without a database within reach.
 */
export default async function CompetitionPage() {
  await connection();
  const archive = await getCompetitionArchive();
  const ranks = Array.from({ length: archive.deepestRank }, (_, index) => index + 1);
  const span = archive.years.length > 0 ? { from: archive.years[archive.years.length - 1].year, to: archive.years[0].year } : null;

  return (
    <main id="main-content" className="competition-page" tabIndex={-1}>
      <header className="shell competition-lede">
        <p className="section-index">ผลการประกวด</p>
        <h1>
          เรือพระที่ติดอันดับ
          <br />
          งานลากพระปากพะยูน
        </h1>
        {span && (
          <p className="lead">
            ตั้งแต่ปีแรกที่มีการชิงถ้วยพระราชทาน พ.ศ. {span.from} ถึง พ.ศ. {span.to}
            {" — "}
            จัดประกวด {archive.judgedYears} ปี จากทั้งหมด {archive.years.length} ปีที่บันทึกไว้
          </p>
        )}
      </header>

      {archive.temples.length > 0 && (
        <section className="shell competition-block" aria-labelledby="competition-temples">
          <h2 id="competition-temples">รวมผลรายวัด</h2>
          <p className="competition-note">
            นับเฉพาะปีที่มีการประกวดและมีประกาศผล เรียงตามจำนวนครั้งที่ได้ที่ 1
          </p>
          {/* Wider than a phone, so it scrolls in place. Focusable and labelled, because a
              keyboard user with no pointer has no other way to reach the right-hand columns. */}
          <div className="competition-scroll" tabIndex={0} role="region" aria-label="ตารางรวมผลรายวัด เลื่อนดูทางแนวนอนได้">
            <table className="competition-table">
              <caption className="sr-only">
                จำนวนครั้งที่แต่ละวัดติดอันดับ แยกตามอันดับที่ได้ ระหว่าง พ.ศ. {span?.from} ถึง {span?.to}
              </caption>
              <thead>
                <tr>
                  <th scope="col">วัด</th>
                  {ranks.map((rank) => (
                    <th key={rank} scope="col" className="competition-num">
                      {rankLabel(rank)}
                    </th>
                  ))}
                  <th scope="col" className="competition-num">
                    รวม
                  </th>
                </tr>
              </thead>
              <tbody>
                {archive.temples.map((temple) => (
                  <tr key={temple.templeName}>
                    <th scope="row">
                      {temple.templeName}
                      {temple.wins > 0 && (
                        <span className="competition-wins">
                          <Trophy aria-hidden="true" />
                          <span className="sr-only">ได้ที่ 1 </span>
                          {temple.wins} ครั้ง
                        </span>
                      )}
                    </th>
                    {ranks.map((rank) => (
                      <td key={rank} className="competition-num">
                        {temple.byRank[rank] ?? <span className="competition-zero" aria-label="ไม่มี">—</span>}
                      </td>
                    ))}
                    <td className="competition-num competition-total">{temple.placings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="shell competition-block" aria-labelledby="competition-years">
        <h2 id="competition-years">ผลรายปี</h2>
        <ol className="competition-years">
          {archive.years.map((year) => (
            <li key={year.year} className="competition-year" data-held={year.held}>
              <h3>พ.ศ. {year.year}</h3>
              {year.held ? (
                <ol className="competition-places">
                  {year.placings.map((placing) => (
                    <li key={placing.rank} data-rank={placing.rank}>
                      <span className="competition-rank">{rankLabel(placing.rank)}</span>
                      <span className="competition-temple">
                        {placing.templeName}
                        <small>{placing.templeCommunity}</small>
                      </span>
                      {placing.note && <span className="competition-variant">{placing.note}</span>}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="competition-nothing">{year.note ?? "ไม่ได้จัดงาน"}</p>
              )}
              {year.held && year.note && <p className="competition-note">{year.note}</p>}
            </li>
          ))}
        </ol>
      </section>

      <section className="shell competition-block" aria-labelledby="competition-source">
        <h2 id="competition-source">ที่มาของข้อมูลหน้านี้</h2>
        <div className="about-prose">
          {archive.source ? (
            <>
              <p>
                {archive.source.title}
                {archive.source.citation ? ` · ${archive.source.citation}` : ""}
              </p>
              {archive.source.status !== "VERIFIED" && archive.source.status !== "PUBLISHED" && (
                <p className="competition-pending" role="note">
                  ยังไม่ได้ตรวจสอบกับประกาศของผู้จัดงาน และยังไม่ได้บันทึกลิงก์ของประกาศไว้
                  ถ้าพบว่ารายการใดคลาดเคลื่อน โปรดแจ้งเพื่อแก้ไข
                </p>
              )}
            </>
          ) : (
            <p className="competition-pending" role="note">ยังไม่ได้บันทึกที่มาของข้อมูลชุดนี้</p>
          )}
          <p>
            ชื่อวัดบางแห่งถูกบันทึกมาด้วยตัวสะกดต่างกันในแต่ละปี หน้านี้ใช้ตัวสะกดที่ยืนยันแล้ว
            และกำกับตัวสะกดเดิมไว้ในรายการปีนั้น ๆ
          </p>
        </div>
      </section>

      <div className="shell">
        <BackNav
          destinations={[
            { href: "/", label: "กลับหน้าหลัก" },
            { href: "/craft", label: "ดูกระบวนการงานช่าง" },
            { href: "/about", label: "เกี่ยวกับโครงการ" },
          ]}
        />
      </div>
    </main>
  );
}
