import "server-only";
import { getDb } from "@/lib/db";

const imageSelect = { url: true, alt: true, width: true, height: true, credit: true, focalX: true, focalY: true } as const;

/** Reviewed means a person checked it with the artisans or the community. */
function isReviewed(status?: string | null) {
  return status === "VERIFIED" || status === "PUBLISHED";
}

/**
 * Field records when there are any, fixtures only when there are none — the same rule the
 * homepage follows, so a collection never mixes the two. `showingDemo` lets the page say
 * so instead of letting fixtures pass for the archive.
 */
function preferField<T extends { isDemo: boolean }>(records: T[]) {
  const field = records.filter((record) => !record.isDemo);
  return field.length > 0 ? { items: field, showingDemo: false } : { items: records, showingDemo: records.length > 0 };
}

function summarise<T extends { isDemo: boolean; status?: string | null }>(records: T[]) {
  const { items, showingDemo } = preferField(records);
  return { items, showingDemo, pending: items.filter((item) => !isReviewed(item.status)).length };
}

/** Every boat in the archive, newest procession first. */
export async function getBoatIndex() {
  const rows = await getDb().boat.findMany({
    orderBy: [{ year: "desc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      year: true,
      isDemo: true,
      temple: { select: { name: true } },
      coverMedia: { select: imageSelect },
      verification: { select: { status: true } },
      _count: { select: { sections: true } },
    },
  });
  return summarise(rows.map(({ verification, ...row }) => ({ ...row, status: verification?.status })));
}

/** Every pattern, in the order the field team recorded them. */
export async function getPatternIndex() {
  const rows = await getDb().pattern.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      slug: true,
      name: true,
      localName: true,
      category: true,
      characteristics: true,
      isDemo: true,
      imageMedia: { select: imageSelect },
      verification: { select: { status: true } },
      // Counted against field boats only, so a pattern is never credited to a fixture.
      _count: { select: { boats: { where: { boat: { isDemo: false } } } } },
    },
  });
  return summarise(rows.map(({ verification, ...row }) => ({ ...row, status: verification?.status })));
}

/** Every artisan the archive has a record for. */
export async function getMasterIndex() {
  const rows = await getDb().master.findMany({
    orderBy: [{ practiceSinceYear: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      biography: true,
      isDemo: true,
      portraitMedia: { select: imageSelect },
      verification: { select: { status: true } },
      expertise: { orderBy: { title: "asc" }, take: 3, select: { title: true } },
    },
  });
  return summarise(rows.map(({ verification, ...row }) => ({ ...row, status: verification?.status })));
}

/**
 * Published work by learners. Never falls back to fixtures: a gallery of invented student
 * work would present the project's targets as though they had been met.
 */
export async function getWorkIndex() {
  return getDb().studentWork.findMany({
    where: { published: true, isDemo: false },
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      title: true,
      concept: true,
      user: { select: { name: true } },
      pattern: { select: { slug: true, name: true, localName: true } },
      media: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
    },
  });
}
