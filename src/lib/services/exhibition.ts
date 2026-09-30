import "server-only";
import { getDb } from "@/lib/db";

const imageSelect = { url: true, alt: true, width: true, height: true, credit: true, focalX: true, focalY: true } as const;

/**
 * What the exhibition landing page needs, in one round trip.
 *
 * The counts are read live rather than written into the page, because a board can stand in
 * a hall for weeks while the team keeps recording. A number printed on the panel would go
 * stale; this one does not.
 *
 * Demo fixtures are excluded outright here. Everywhere else the site falls back to them
 * when a category has nothing real yet, which is right for a site under construction and
 * wrong for a figure someone reads standing in front of a poster.
 */
export async function getExhibitionContent() {
  const db = getDb();
  const [cover, boats, sections, patterns, steps] = await Promise.all([
    db.boat.findFirst({
      where: { isDemo: false, coverMediaId: { not: null } },
      orderBy: { year: "desc" },
      select: { coverMedia: { select: imageSelect } },
    }),
    db.boat.count({ where: { isDemo: false } }),
    db.boatSection.count({ where: { isDemo: false } }),
    db.pattern.count({ where: { isDemo: false } }),
    db.processStep.count({ where: { isDemo: false } }),
  ]);

  return {
    cover: cover?.coverMedia ?? null,
    counts: { boats, sections, patterns, steps },
  };
}
