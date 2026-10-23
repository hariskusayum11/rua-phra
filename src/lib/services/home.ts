import "server-only";
import { getDb } from "@/lib/db";

/**
 * The homepage is one narrative, so it reads as one query set rather than a query per
 * component. Visual components receive already-shaped records and never reach for the
 * database themselves.
 */

const imageSelect = { url: true, alt: true, width: true, height: true, credit: true, focalX: true, focalY: true } as const;

export async function getHomeContent() {
  const db = getDb();

  const [boats, process, patterns, course] = await Promise.all([
    db.boat.findMany({
      where: { isDemo: false },
      orderBy: [{ year: "desc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        year: true,
        concept: true,
        summary: true,
        isDemo: true,
        temple: { select: { name: true, community: true } },
        coverMedia: { where: { isDemo: false }, select: imageSelect },
        sections: {
          where: { isDemo: false },
          orderBy: { position: "asc" },
          select: {
            id: true,
            slug: true,
            name: true,
            x: true,
            y: true,
            description: true,
            meaning: true,
            verification: { select: { status: true } },
            closeupMedia: { where: { isDemo: false }, select: imageSelect },
            patterns: { where: { pattern: { isDemo: false } }, select: { pattern: { select: { slug: true, name: true, localName: true } } } },
          },
        },
        _count: { select: { sections: true, stories: true, patterns: true } },
      },
    }),
    db.knowledgeProcess.findFirst({
      where: { isDemo: false },
      orderBy: [{ isDemo: "asc" }, { createdAt: "asc" }],
      select: {
        slug: true,
        title: true,
        description: true,
        isDemo: true,
        steps: {
          where: { isDemo: false },
          orderBy: { position: "asc" },
          select: {
            slug: true,
            title: true,
            description: true,
            importance: true,
            position: true,
            coverMedia: { where: { isDemo: false }, select: imageSelect },
            media: { where: { media: { isDemo: false } }, orderBy: { position: "asc" }, select: { media: { select: imageSelect } } },
          },
        },
      },
    }),
    db.pattern.findMany({
      where: { isDemo: false },
      // Recording order, so the first pattern the field team entered anchors the wall.
      orderBy: [{ isDemo: "asc" }, { createdAt: "asc" }],
      select: {
        slug: true,
        name: true,
        localName: true,
        category: true,
        characteristics: true,
        meaning: true,
        isDemo: true,
        imageMedia: { where: { isDemo: false }, select: imageSelect },
      },
    }),
    db.course.findFirst({
      orderBy: [{ isDemo: "asc" }, { createdAt: "asc" }],
      select: {
        slug: true,
        title: true,
        description: true,
        isDemo: true,
        lessons: { orderBy: { position: "asc" }, select: { slug: true, title: true, position: true } },
      },
    }),
  ]);

  const steps = process?.steps ?? [];

  /**
   * Every boat the reader can actually open: it needs a photograph to place hotspots on and
   * at least one hotspot to place. The homepage reads one of them closely and hands the
   * rest to the boats page, which lists them all.
   */
  const readerBoats = boats.filter((boat) => boat.coverMedia?.url && boat.sections.length > 0);
  const heroBoat = boats.find((boat) => boat.coverMedia?.url) ?? null;
  const craftImage = steps[Math.floor(steps.length / 2)]?.coverMedia ?? steps.find(step => step.coverMedia)?.coverMedia ?? null;

  return {
    heroBoat,
    pillarImages: [
      patterns.find(pattern => pattern.imageMedia)?.imageMedia ?? null,
      heroBoat?.sections.find(section => section.closeupMedia)?.closeupMedia ?? heroBoat?.coverMedia ?? null,
      boats.find(boat => boat.slug !== heroBoat?.slug && boat.coverMedia)?.coverMedia ?? heroBoat?.coverMedia ?? null,
      craftImage,
    ],
    galleryImages: [...new Map([
      ...boats.map(boat => boat.coverMedia),
      ...steps.flatMap(step => [step.coverMedia, ...step.media.map(item => item.media)]),
      ...patterns.map(pattern => pattern.imageMedia),
    ].filter((image): image is NonNullable<typeof image> => !!image?.url).map(image => [image.url, image])).values()].slice(0, 12),
    learningImage: craftImage,
    readerBoat: readerBoats[0] ?? null,
    readerBoats,
    process: process ? { slug: process.slug, title: process.title, description: process.description, isDemo: process.isDemo, steps } : null,
    patterns,
    course: course ? { ...course, lessonCount: course.lessons.length } : null,
    counts: {
      boats: boats.length,
      steps: process && !process.isDemo ? steps.length : 0,
    },
  };
}

export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>;
export type HomeBoat = NonNullable<HomeContent["readerBoat"]>;
export type HomeSection = HomeBoat["sections"][number];
export type HomePattern = HomeContent["patterns"][number];
export type HomeStep = NonNullable<HomeContent["process"]>["steps"][number];
export type HomeImage = NonNullable<HomeBoat["coverMedia"]>;
