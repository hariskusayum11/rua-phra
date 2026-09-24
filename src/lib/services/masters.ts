import "server-only";
import { getDb } from "@/lib/db";

const imageSelect = { url: true, alt: true, width: true, height: true, credit: true, focalX: true, focalY: true } as const;

/** One artisan, with the boats, patterns and steps the archive connects them to. */
export async function getMasterDetail(slug: string) {
  return getDb().master.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      biography: true,
      quote: true,
      practiceSinceYear: true,
      isDemo: true,
      portraitMedia: { select: imageSelect },
      interviewMedia: { select: { url: true, alt: true, mimeType: true, durationSeconds: true, credit: true } },
      verification: { select: { status: true, note: true } },
      expertise: { orderBy: { title: "asc" }, select: { title: true } },
      boats: {
        select: {
          contribution: true,
          boat: {
            select: { slug: true, name: true, year: true, temple: { select: { name: true } }, coverMedia: { select: imageSelect } },
          },
        },
      },
      patterns: { select: { pattern: { select: { slug: true, name: true, localName: true, imageMedia: { select: imageSelect } } } } },
      steps: { select: { contribution: true, step: { select: { slug: true, title: true, position: true } } } },
    },
  });
}

export type MasterDetail = NonNullable<Awaited<ReturnType<typeof getMasterDetail>>>;

export function getMasterIndex() {
  return getDb().master.findMany({
    orderBy: [{ isDemo: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      biography: true,
      practiceSinceYear: true,
      isDemo: true,
      portraitMedia: { select: imageSelect },
      _count: { select: { boats: true, patterns: true } },
    },
  });
}

/**
 * The archive records the year practice began rather than a duration, so the number stays
 * true as years pass.
 */
export function yearsOfPractice(since: number | null) {
  if (!since) return null;
  const currentBuddhistYear = new Date().getFullYear() + 543;
  const years = currentBuddhistYear - since;
  return years > 0 ? years : null;
}
