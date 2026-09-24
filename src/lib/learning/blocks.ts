import { z } from "zod";

/**
 * What a lesson is allowed to be made of.
 *
 * `LessonContent.body` is a Json column, so anything can end up in it — an editor mid-edit,
 * a shape from an older version, a typo in a hand-written import. Every block is parsed on
 * the way out and a block that does not parse is dropped rather than crashing the lesson.
 * A lesson missing one paragraph is recoverable; a lesson that will not render is not.
 *
 * The vocabulary is deliberately small. Teaching material here is mostly prose, the archive's
 * own photographs, and pointers back into the records — not a page builder.
 */
export const blockSchemas = {
  /** A run of prose. Blank lines separate paragraphs. */
  text: z.object({ text: z.string().trim().min(1) }),
  /** A photograph from the media library, by id, so credit and alt text stay in one place. */
  image: z.object({
    mediaId: z.string().uuid(),
    caption: z.string().trim().optional(),
  }),
  /** A pointer into the craft process, so a lesson can send the reader to the real record. */
  step: z.object({
    stepSlug: z.string().trim().min(1),
    note: z.string().trim().optional(),
  }),
  /** Something the learner is asked to do away from the screen. */
  activity: z.object({
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    materials: z.array(z.string().trim().min(1)).default([]),
  }),
} as const;

export type BlockKind = keyof typeof blockSchemas;

export const blockKinds = Object.keys(blockSchemas) as BlockKind[];

export const blockKindLabels: Record<BlockKind, string> = {
  text: "ข้อความ",
  image: "ภาพจากคลัง",
  step: "ลิงก์ไปขั้นตอนงานช่าง",
  activity: "กิจกรรมให้ลงมือทำ",
};

export type ParsedBlock =
  | { kind: "text"; id: string; body: z.infer<typeof blockSchemas.text> }
  | { kind: "image"; id: string; body: z.infer<typeof blockSchemas.image> }
  | { kind: "step"; id: string; body: z.infer<typeof blockSchemas.step> }
  | { kind: "activity"; id: string; body: z.infer<typeof blockSchemas.activity> };

export function isBlockKind(value: string): value is BlockKind {
  return value in blockSchemas;
}

/** Parses one stored row, returning null for anything that does not fit the vocabulary. */
export function parseBlock(row: { id: string; kind: string; body: unknown }): ParsedBlock | null {
  if (!isBlockKind(row.kind)) return null;
  const result = blockSchemas[row.kind].safeParse(row.body);
  if (!result.success) return null;
  return { kind: row.kind, id: row.id, body: result.data } as ParsedBlock;
}

/** Splits a prose block on blank lines, the way the editor typed it. */
export function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}
