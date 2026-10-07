import { z } from "zod";

/**
 * The placings of one competition year, as the editor posts them.
 *
 * The rank is not stored in the payload — it is the row's position in the list. An editor
 * who deletes second place should get a new second place, not a gap and two rows both
 * claiming to be third, and a rank typed into a box lets both of those happen.
 */
export const rankingRows = z.array(
  z.object({
    templeId: z.string().uuid("กรุณาเลือกวัด"),
    note: z.preprocess((value) => (value == null || value === "" ? undefined : value), z.string().trim().max(500).optional()),
  }),
);

export type RankingRow = z.infer<typeof rankingRows>[number];

export function readRanking(raw: string): RankingRow[] {
  if (!raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const row = item as { templeId?: unknown; note?: unknown };
      return {
        templeId: typeof row.templeId === "string" ? row.templeId : "",
        note: typeof row.note === "string" ? row.note : "",
      };
    }) as RankingRow[];
  } catch {
    return [];
  }
}
