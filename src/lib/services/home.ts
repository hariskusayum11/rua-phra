import "server-only";
import { getDb } from "@/lib/db";

/**
 * The homepage is one narrative, so it reads as one query set rather than a query per
 * component. Visual components receive already-shaped records and never reach for the
 * database themselves.
 */

const imageSelect = { url: true, alt: true, width: true, height: true, credit: true, focalX: true, focalY: true } as const;

/**
 * Demo fixtures stay in the database because the test suite runs against them, but the
 * moment real field records exist for a kind of content, the fixtures stop being shown.
 * A half-real page is worse than either a real one or an honestly empty one.
 */
function preferField<T extends { isDemo: boolean }>(records: T[]) {
  const field = records.filter((record) => !record.isDemo);
  return field.length > 0 ? field : records;
}

/**
 * The craft section frames a macro close-up and the closing section frames the finished
 * boat. Both are the step's second image when the field team has attached one; the 3:2
 * documentation cover is the fallback.
 */
function preferCloseup<T extends { coverMedia: unknown; media: { media: unknown }[] }>(step: T) {
  return (step.media[1]?.media ?? step.media[0]?.media ?? step.coverMedia) as T["coverMedia"];
}

export async function getHomeContent() {
  const db = getDb();

  const [boats, process, patterns, masters, course, works, counts] = await Promise.all([
    db.boat.findMany({
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
        coverMedia: { select: imageSelect },
        processionMedia: {
          select: {
            url: true,
            alt: true,
            mimeType: true,
            durationSeconds: true,
            credit: true,
            posterMedia: { select: imageSelect },
          },
        },
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
            closeupMedia: { select: imageSelect },
            patterns: { select: { pattern: { select: { slug: true, name: true, localName: true } } } },
          },
        },
        _count: { select: { sections: true, stories: true, patterns: true } },
      },
    }),
    db.knowledgeProcess.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        slug: true,
        title: true,
        description: true,
        isDemo: true,
        steps: {
          orderBy: { position: "asc" },
          select: {
            slug: true,
            title: true,
            description: true,
            importance: true,
            position: true,
            coverMedia: { select: imageSelect },
            media: { orderBy: { position: "asc" }, select: { media: { select: imageSelect } } },
          },
        },
      },
    }),
    db.pattern.findMany({
      // Recording order, so the first pattern the field team entered anchors the wall.
      orderBy: { createdAt: "asc" },
      select: {
        slug: true,
        name: true,
        localName: true,
        category: true,
        characteristics: true,
        meaning: true,
        isDemo: true,
        imageMedia: { select: imageSelect },
        boats: { take: 1, select: { boat: { select: { slug: true, name: true } } } },
      },
    }),
    db.master.findMany({
      orderBy: [{ practiceSinceYear: "asc" }, { name: "asc" }],
      select: {
        slug: true,
        name: true,
        biography: true,
        quote: true,
        practiceSinceYear: true,
        isDemo: true,
        portraitMedia: { select: imageSelect },
        interviewMedia: { select: { url: true, alt: true, mimeType: true, durationSeconds: true } },
        expertise: { orderBy: { title: "asc" }, select: { title: true } },
        _count: { select: { patterns: true, boats: true } },
      },
    }),
    db.course.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        slug: true,
        title: true,
        description: true,
        isDemo: true,
        lessons: { orderBy: { position: "asc" }, select: { slug: true, title: true, position: true } },
      },
    }),
    db.studentWork.findMany({
      where: { published: true },
      orderBy: { createdAt: "asc" },
      take: 6,
      select: {
        slug: true,
        title: true,
        concept: true,
        inspiration: true,
        isDemo: true,
        user: { select: { name: true } },
        pattern: { select: { slug: true, name: true, localName: true } },
        media: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
      },
    }),
    Promise.all([db.boat.count(), db.pattern.count(), db.master.count(), db.processStep.count()]),
  ]);

  const [boatCount, patternCount, masterCount, stepCount] = counts;
  const steps = process?.steps ?? [];
  const rankedBoats = preferField(boats);
  const rankedPatterns = preferField(patterns);
  const rankedMasters = preferField(masters);

  /**
   * The middle of the sequence is where paper stops being material and starts being
   * pattern, so that step carries the craft section rather than an arbitrary first step.
   */
  const craftStep = steps.length > 0 ? steps[Math.floor(steps.length / 2)] : null;
  const finalStep = steps.at(-1) ?? null;

  /** The interactive preview needs hotspots and an image; the first boat that has both wins. */
  const readerBoat = rankedBoats.find((boat) => boat.coverMedia?.url && boat.sections.length > 0) ?? null;

  /** Procession footage belongs to a boat, so it follows whichever boat the page leads with. */
  const processionBoat = rankedBoats.find((boat) => boat.processionMedia?.url) ?? null;

  return {
    boats: rankedBoats,
    heroBoat: rankedBoats.find((boat) => boat.coverMedia?.url) ?? null,
    featuredBoats: rankedBoats.filter((boat) => boat.coverMedia?.url),
    readerBoat,
    processionBoat,
    process: process ? { slug: process.slug, title: process.title, description: process.description, isDemo: process.isDemo, steps } : null,
    craftImage: craftStep ? preferCloseup(craftStep) : null,
    craftStep,
    closingImage: finalStep ? preferCloseup(finalStep) : (boats.at(-1)?.coverMedia ?? null),
    patterns: rankedPatterns,
    master: rankedMasters[0] ?? null,
    masters: rankedMasters,
    course: course ? { ...course, lessonCount: course.lessons.length } : null,
    works,
    counts: { boats: boatCount, patterns: patternCount, masters: masterCount, steps: stepCount },
  };
}

export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>;
export type HomeBoat = HomeContent["boats"][number];
export type HomeSection = HomeBoat["sections"][number];
export type HomePattern = HomeContent["patterns"][number];
export type HomeStep = NonNullable<HomeContent["process"]>["steps"][number];
export type HomeWork = HomeContent["works"][number];
export type HomeMaster = NonNullable<HomeContent["master"]>;
export type HomeImage = NonNullable<HomeBoat["coverMedia"]>;
export type HomeProcessionBoat = NonNullable<HomeContent["processionBoat"]>;
