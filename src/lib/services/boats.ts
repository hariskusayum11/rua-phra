import "server-only";
import { getDb } from "@/lib/db";

export async function getBoatExplorer(slug: string) {
  return getDb().boat.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      year: true,
      concept: true,
      summary: true,
      isDemo: true,
      temple: { select: { name: true } },
      coverMedia: { select: { url: true, alt: true, width: true, height: true, focalX: true, focalY: true } },
      masters: { select: { master: { select: { slug: true, name: true } } } },
      sections: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          x: true,
          y: true,
          description: true,
          meaning: true,
          closeupMedia: { select: { url: true, alt: true, width: true, height: true, focalX: true, focalY: true } },
          patterns: {
            select: {
              pattern: {
                select: {
                  slug: true,
                  name: true,
                  localName: true,
                  imageMedia: { select: { url: true, alt: true } },
                  masters: { select: { master: { select: { slug: true, name: true } } } },
                  steps: { select: { step: { select: { slug: true, title: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });
}

export type BoatExplorerRecord = NonNullable<Awaited<ReturnType<typeof getBoatExplorer>>>;
