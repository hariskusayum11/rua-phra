import "server-only";
import { getDb } from "@/lib/db";

const mediaSelect = { url: true, alt: true, width: true, height: true, credit: true, focalX: true, focalY: true } as const;

export function getKnowledgeProcesses() {
  return getDb().knowledgeProcess.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      isDemo: true,
      verification: { select: { status: true } },
      steps: {
        orderBy: { position: "asc" },
        select: {
          slug: true,
          title: true,
          description: true,
          importance: true,
          position: true,
          isDemo: true,
          coverMedia: { select: mediaSelect },
          materials: { select: { material: { select: { name: true } } } },
          tools: { select: { tool: { select: { name: true } } } },
        },
      },
    },
  });
}

export function getProcessStep(slug: string) {
  return getDb().processStep.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      description: true,
      importance: true,
      instructions: true,
      tips: true,
      warnings: true,
      position: true,
      isDemo: true,
      verification: { select: { status: true, verifiedAt: true } },
      process: {
        select: {
          slug: true,
          title: true,
          steps: { orderBy: { position: "asc" }, select: { slug: true, title: true, position: true } },
        },
      },
      coverMedia: { select: mediaSelect },
      videoMedia: { select: { url: true, alt: true, mimeType: true, credit: true } },
      media: {
        orderBy: { position: "asc" },
        select: { role: true, position: true, caption: true, media: { select: mediaSelect } },
      },
      materials: {
        select: { quantityNote: true, material: { select: { slug: true, name: true, description: true } } },
      },
      tools: {
        select: { usageNote: true, tool: { select: { slug: true, name: true, description: true } } },
      },
      techniques: {
        select: { note: true, technique: { select: { slug: true, name: true, description: true } } },
      },
      patterns: {
        select: { pattern: { select: { slug: true, name: true, localName: true, imageMedia: { select: mediaSelect } } } },
      },
      masters: {
        select: { contribution: true, master: { select: { slug: true, name: true, quote: true, portraitMedia: { select: mediaSelect } } } },
      },
    },
  });
}

export type ProcessStepRecord = NonNullable<Awaited<ReturnType<typeof getProcessStep>>>;

export function parseInstructions(value: unknown): Array<{ order: number; text: string }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.text !== "string") return [];
    return [{ order: typeof record.order === "number" ? record.order : 0, text: record.text }];
  }).sort((a, b) => a.order - b.order);
}
