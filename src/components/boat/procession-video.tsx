import { mediaUrl } from "@/lib/services/media";
import type { BoatExplorerRecord } from "@/lib/services/boats";

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return null;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")} นาที`;
}

/**
 * The day this boat left the shed.
 *
 * Footage belongs to one boat and one year, so it lives on that boat's page rather than
 * on the homepage. It never plays on its own: it carries a poster frame and loads nothing
 * until someone presses play, because a two-minute clip is a real cost to anyone on mobile
 * data and the page has no right to spend it uninvited.
 */
export function ProcessionVideo({ video }: { video: BoatExplorerRecord["processionMedia"] }) {
  const source = mediaUrl(video?.url);
  if (!video || !source) return null;

  const duration = formatDuration(video.durationSeconds);

  return (
    <section className="boat-procession" id="procession" aria-labelledby="procession-title">
      <p className="section-index">วันชักพระ</p>
      <h2 id="procession-title">ภาพเคลื่อนไหวจากวันชักพระ</h2>
      <p className="lead">ชมวิดีโอที่เชื่อมไว้กับบันทึกของเรือลำนี้ พร้อมข้อมูลผู้บันทึกที่ระบุไว้ใต้คลิป</p>
      <figure>
        <video
          className="boat-procession-video"
          controls
          preload="none"
          playsInline
          poster={mediaUrl(video.posterMedia?.url) ?? undefined}
          aria-label={video.alt}
        >
          <source src={source} type={video.mimeType} />
          เบราว์เซอร์นี้เล่นวิดีโอไม่ได้ — {video.alt}
        </video>
        <figcaption className="boat-procession-caption">
          <span>{video.alt}</span>
          <span className="caption">{[duration, video.credit].filter(Boolean).join(" · ")}</span>
        </figcaption>
      </figure>
      <p className="caption">คลิปนี้ยังไม่มีคำบรรยายประกอบเสียง และจะเพิ่มเมื่อถอดเสียงเสร็จ</p>
    </section>
  );
}
