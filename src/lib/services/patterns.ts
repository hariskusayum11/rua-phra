import "server-only";
import { getDb } from "@/lib/db";

const imageSelect = { url: true, alt: true, width: true, height: true, credit: true, focalX: true, focalY: true } as const;

/**
 * One pattern and everything the archive knows it connects to.
 *
 * A pattern is only meaningful through its relations — which boat carries it, who makes it,
 * which step produces it — so the detail page loads all of them rather than making the
 * reader hop back to the homepage to find out.
 */
export async function getPatternDetail(slug: string) {
  return getDb().pattern.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      localName: true,
      category: true,
      characteristics: true,
      meaning: true,
      historicalNote: true,
      isDemo: true,
      imageMedia: { select: imageSelect },
      verification: { select: { status: true, note: true } },
      boats: {
        select: {
          boat: {
            select: { slug: true, name: true, year: true, temple: { select: { name: true } }, coverMedia: { select: imageSelect } },
          },
        },
      },
      sections: {
        select: {
          section: {
            select: {
              slug: true,
              name: true,
              closeupMedia: { select: imageSelect },
              boat: { select: { slug: true, name: true, year: true } },
            },
          },
        },
      },
      masters: { select: { master: { select: { slug: true, name: true, portraitMedia: { select: imageSelect } } } } },
      steps: { select: { step: { select: { slug: true, title: true, position: true } } } },
    },
  });
}

export type PatternDetail = NonNullable<Awaited<ReturnType<typeof getPatternDetail>>>;

/** Every pattern that has a page, newest record first. Used for the index and for prerendering. */
export function getPatternIndex() {
  return getDb().pattern.findMany({
    orderBy: [{ isDemo: "asc" }, { createdAt: "asc" }],
    select: {
      slug: true,
      name: true,
      localName: true,
      category: true,
      characteristics: true,
      isDemo: true,
      imageMedia: { select: imageSelect },
      _count: { select: { boats: true, masters: true } },
    },
  });
}
