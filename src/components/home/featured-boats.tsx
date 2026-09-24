"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import type { HomeBoat } from "@/lib/services/home";

/**
 * Section 04 — a magazine spread, one boat at a time.
 *
 * The reader moves between boats; nothing advances on its own. A small live region
 * announces the change, so the whole spread is not re-read on every step.
 */
export function FeaturedBoats({ boats }: { boats: HomeBoat[] }) {
  const [index, setIndex] = useState(0);
  const total = boats.length;
  const boat = boats[index];

  if (!boat) {
    return (
      <section className="home-featured on-dark" aria-labelledby="featured-title">
        <div className="shell">
          <p className="section-index">03 / เรือหนึ่งลำ หนึ่งเรื่องราว</p>
          <h2 id="featured-title" className="home-featured-title">เรือหนึ่งลำ หนึ่งเรื่องราว</h2>
          <p className="empty-note">ยังไม่มีเรือพระที่บันทึกภาพไว้ในคลัง เมื่อทีมภาคสนามบันทึกข้อมูลแล้ว เรือจะปรากฏในพื้นที่นี้</p>
        </div>
      </section>
    );
  }

  const move = (direction: 1 | -1) => setIndex((current) => (current + direction + total) % total);

  return (
    <section className="home-featured on-dark" id="boats" aria-labelledby="featured-title">
      <div className="shell home-featured-head">
        <div>
          <p className="section-index">03 / เรื่องเล่าเรือพระ</p>
          <h2 id="featured-title" className="home-featured-title">เรือหนึ่งลำ หนึ่งเรื่องราว</h2>
        </div>
        {total > 1 && (
          <div className="home-featured-controls">
            <button type="button" onClick={() => move(-1)} aria-label="เรือลำก่อนหน้า">
              <ArrowLeft aria-hidden="true" />
            </button>
            <p aria-hidden="true">
              {String(index + 1).padStart(2, "0")} <span>/</span> {String(total).padStart(2, "0")}
            </p>
            <button type="button" onClick={() => move(1)} aria-label="เรือลำถัดไป">
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="shell">
        <p className="sr-only" aria-live="polite">
          {`เรือลำที่ ${index + 1} จาก ${total}: ${boat.name}`}
        </p>
        <article className="home-featured-spread">
          <MediaFrame
            key={boat.slug}
            image={boat.coverMedia}
            ratio="16/9"
            sizes="(max-width: 63.99rem) 100vw, 1280px"
            className="home-featured-image"
          />

          <div className="home-featured-body">
            <div className="home-featured-story">
              {/* A temple often builds a boat every year, so the year is part of which
                  boat this is, not a detail filed away in the metadata list. */}
              <h3>
                {boat.name} <span className="home-featured-year">พ.ศ. {boat.year}</span>
              </h3>
              {/* Labelled rather than quoted: a boat whose concept is not yet recorded
                  would otherwise read as though the archive were quoting the note. */}
              <p className="home-featured-concept">
                <span>แนวคิด</span>
                {boat.concept}
              </p>
              <p className="home-featured-summary">{boat.summary}</p>
              {boat.isDemo && <p className="demo-flag">ข้อมูลสาธิต</p>}
              <Link className="editorial-link" href={`/boats/${boat.slug}`}>
                อ่านเรื่องราว
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>

            <dl className="home-featured-meta">
              <div>
                <dt>วัด</dt>
                <dd>{boat.temple.name}</dd>
              </div>
              <div>
                <dt>ชุมชน</dt>
                <dd>{boat.temple.community}</dd>
              </div>
              <div>
                <dt>จุดสำรวจ</dt>
                <dd>{boat._count.sections} จุด</dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </section>
  );
}
