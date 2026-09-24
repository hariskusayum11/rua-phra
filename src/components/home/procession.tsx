import { Reveal } from "@/components/motion/reveal";
import { mediaUrl } from "@/lib/services/media";
import type { HomeContent } from "@/lib/services/home";

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return null;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")} นาที`;
}

/**
 * Section 10 — the day the work leaves the shed.
 *
 * The footage never plays on its own. It carries a poster frame and loads nothing until
 * someone presses play, because a two-minute clip is a real cost to anyone on mobile data
 * and the page has no right to spend it uninvited.
 */
export function Procession({ boat }: { boat: HomeContent["processionBoat"] }) {
  const video = boat?.processionMedia;
  const source = mediaUrl(video?.url);
  if (!boat || !video || !source) return null;

  const duration = formatDuration(video.durationSeconds);

  return (
    <section className="home-procession on-dark" id="procession" aria-labelledby="procession-title">
      <div className="shell home-procession-head">
        <p className="section-index">10 / วันชักพระ</p>
        <h2 id="procession-title">
          เรือออกจากโรง
          <br />
          แล้วชุมชนก็พาไปต่อ
        </h2>
        <p className="lead">
          งานกระดาษที่ใช้เวลาหลายเดือนมีปลายทางอยู่ที่วันนี้ วันที่ทั้งชุมชนมาจับเชือกเส้นเดียวกัน
        </p>
      </div>

      <Reveal className="shell home-procession-stage">
        <figure>
          <video
            className="home-procession-video"
            controls
            preload="none"
            playsInline
            poster={mediaUrl(video.posterMedia?.url) ?? undefined}
            aria-label={video.alt}
          >
            <source src={source} type={video.mimeType} />
            เบราว์เซอร์นี้เล่นวิดีโอไม่ได้ — {video.alt}
          </video>
          <figcaption className="home-procession-caption">
            <span>{video.alt}</span>
            <span className="caption">
              {[duration, video.credit].filter(Boolean).join(" · ")}
            </span>
          </figcaption>
        </figure>
      </Reveal>

      <p className="shell home-procession-note">
        คลิปนี้ยังไม่มีคำบรรยายประกอบเสียง และจะเพิ่มเมื่อถอดเสียงเสร็จ
      </p>
    </section>
  );
}
