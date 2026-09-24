import { z } from "zod";

const optionalFilter = z.string().trim().max(100)
  .transform((value) => value || undefined)
  .optional().catch(undefined);

export const archiveQuery = z.object({
  q: z.string().trim().max(100).catch(""),
  // Buddhist calendar years are not limited to the current century.
  year: z.string().trim().regex(/^[1-9][0-9]{3}$/).optional().catch(undefined),
  temple: optionalFilter,
  category: optionalFilter,
  master: optionalFilter,
  boat: optionalFilter,
});

export const hotspotCoordinates = z.object({
  x: z.number().finite().min(0).max(100),
  y: z.number().finite().min(0).max(100),
});
