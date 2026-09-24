"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import type { HomeContent } from "@/lib/services/home";

/**
 * Section 06 — the seven steps between paper and boat.
 *
 * Each step is a full editorial block that alternates side on a wide screen and collapses
 * to a single vertical timeline on a narrow one. A sticky rail marks how far the reader
 * has travelled; it observes scroll position but never takes control of it.
 */
export function CraftProcess({ process }: { process: HomeContent["process"] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stopRefs = useRef<(HTMLLIElement | null)[]>([]);
  const allSteps = process?.steps ?? [];
  /**
   * The homepage shows the shape of the craft, not the manual: the first step, the act the
   * craft is named for, and the moment the paper becomes the boat. The full sequence lives
   * on the craft page, one link away.
   */
  const steps =
    allSteps.length > 3
      ? [allSteps[0], allSteps[Math.floor(allSteps.length / 2)], allSteps[allSteps.length - 1]]
      : allSteps;

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const nodes = stopRefs.current.filter((node): node is HTMLLIElement => node !== null);
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = nodes.indexOf(visible.target as HTMLLIElement);
        if (index >= 0) setActiveIndex(index);
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0.1, 0.4, 0.75] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [allSteps.length]);

  if (!process || steps.length === 0) {
    return (
      <section className="home-process" id="process" aria-labelledby="process-title">
        <div className="shell">
          <p className="section-index">05 / จากกระดาษ สู่เรือพระ</p>
          <h2 id="process-title">ภูมิปัญญาไม่ได้เกิดขึ้นในขั้นตอนเดียว</h2>
          <p className="empty-note">ยังไม่มีกระบวนการที่บันทึกไว้ในคลัง ลำดับขั้นตอนจะปรากฏเมื่อทีมภาคสนามบันทึกข้อมูล</p>
        </div>
      </section>
    );
  }

  return (
    <section className="home-process" id="process" aria-labelledby="process-title">
      <div className="shell home-process-head">
        <p className="section-index">05 / จากกระดาษ สู่เรือพระ</p>
        <h2 id="process-title">ภูมิปัญญาไม่ได้เกิดขึ้นในขั้นตอนเดียว</h2>
        <p className="lead">{process.description}</p>
      </div>

      <div className="shell home-process-layout">
        <div className="home-process-rail" aria-hidden="true">
          <ol>
            {steps.map((step, index) => (
              <li key={step.slug} data-state={index === activeIndex ? "active" : index < activeIndex ? "past" : "ahead"}>
                <span>{String(step.position).padStart(2, "0")}</span>
                {step.title}
              </li>
            ))}
          </ol>
        </div>

        <ol className="home-process-track">
          {steps.map((step, index) => (
            <li
              key={step.slug}
              className="home-process-stop"
              ref={(node) => {
                stopRefs.current[index] = node;
              }}
              data-active={index === activeIndex}
            >
              <div className="home-process-stop-copy">
                <p className="home-process-stop-index">{String(step.position).padStart(2, "0")}</p>
                <h3>{step.title}</h3>
                <p className="home-process-stop-text">{step.description}</p>
                <p className="home-process-stop-why">{step.importance}</p>
                <Link className="editorial-link" href={`/craft/${step.slug}`}>
                  ดูขั้นตอนนี้
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
              <MediaFrame
                image={step.coverMedia}
                ratio="3/2"
                sizes="(max-width: 63.99rem) 100vw, 40vw"
                className="home-process-stop-image"
                emptyLabel="ภาพขั้นตอนนี้อยู่ระหว่างการบันทึก"
              />
            </li>
          ))}
        </ol>
      </div>

      {allSteps.length > steps.length && (
        <p className="shell home-process-more">
          <Link className="button-solid" href="/craft">
            สำรวจกระบวนการทั้งหมด {allSteps.length} ขั้นตอน
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </p>
      )}
    </section>
  );
}
