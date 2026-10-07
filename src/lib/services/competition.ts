import "server-only";
import { getDb } from "@/lib/db";

export type CompetitionPlacing = {
  rank: number;
  templeName: string;
  templeCommunity: string;
  note: string | null;
};

export type CompetitionYearRow = {
  year: number;
  held: boolean;
  note: string | null;
  placings: CompetitionPlacing[];
};

export type TempleRecord = {
  templeName: string;
  placings: number;
  wins: number;
  /** Ranks taken, best first, so a run of seconds reads differently from a single win. */
  byRank: Record<number, number>;
  firstYear: number;
  lastYear: number;
};

export type CompetitionArchive = {
  years: CompetitionYearRow[];
  temples: TempleRecord[];
  /** The deepest placing ever awarded, so the summary table knows how many columns to draw. */
  deepestRank: number;
  judgedYears: number;
  source: { title: string; citation: string | null; status: string } | null;
};

/**
 * Every recorded year of the Pak Phayun competition, newest first, plus what the years add
 * up to per temple.
 *
 * The totals are counted here rather than in SQL because the whole table is thirteen rows
 * and thirty-one placings — a size where a second query costs more than the arithmetic.
 *
 * Years with no competition are returned alongside the rest instead of being filtered out.
 * A reader scanning the list should see that 2559, 2560 and 2564 are accounted for, not
 * wonder whether the archive simply lost them.
 */
export async function getCompetitionArchive(): Promise<CompetitionArchive> {
  const db = getDb();
  const rows = await db.competitionYear.findMany({
    orderBy: { year: "desc" },
    include: {
      source: { select: { title: true, citation: true, verification: { select: { status: true } } } },
      results: {
        orderBy: { rank: "asc" },
        select: { rank: true, note: true, temple: { select: { name: true, community: true } } },
      },
    },
  });

  const years: CompetitionYearRow[] = rows.map((row) => ({
    year: row.year,
    held: row.status === "JUDGED",
    note: row.note,
    placings: row.results.map((result) => ({
      rank: result.rank,
      templeName: result.temple.name,
      templeCommunity: result.temple.community,
      note: result.note,
    })),
  }));

  const tally = new Map<string, TempleRecord>();
  for (const year of years) {
    for (const placing of year.placings) {
      const record = tally.get(placing.templeName) ?? {
        templeName: placing.templeName,
        placings: 0,
        wins: 0,
        byRank: {},
        firstYear: year.year,
        lastYear: year.year,
      };
      record.placings += 1;
      if (placing.rank === 1) record.wins += 1;
      record.byRank[placing.rank] = (record.byRank[placing.rank] ?? 0) + 1;
      record.firstYear = Math.min(record.firstYear, year.year);
      record.lastYear = Math.max(record.lastYear, year.year);
      tally.set(placing.templeName, record);
    }
  }

  // Most wins first, then most placings — the order a reader expects from a medal table.
  const temples = [...tally.values()].sort(
    (a, b) => b.wins - a.wins || b.placings - a.placings || a.templeName.localeCompare(b.templeName, "th"),
  );

  const deepestRank = years.reduce(
    (deepest, year) => year.placings.reduce((inner, placing) => Math.max(inner, placing.rank), deepest),
    0,
  );

  const sourceRow = rows.find((row) => row.source)?.source ?? null;

  return {
    years,
    temples,
    deepestRank,
    judgedYears: years.filter((year) => year.held).length,
    source: sourceRow
      ? { title: sourceRow.title, citation: sourceRow.citation, status: sourceRow.verification?.status ?? "DRAFT" }
      : null,
  };
}

/**
 * One temple's record, for a page that is already about that temple.
 *
 * Takes the name rather than an id because the callers that want it — a boat page showing
 * "วัดนี้เคยได้ที่ 1 สี่ครั้ง" — hold a temple relation already and would otherwise have to
 * thread an id through for the sake of one line.
 */
export async function getTempleRecord(templeId: string): Promise<TempleRecord | null> {
  const db = getDb();
  const results = await db.competitionResult.findMany({
    where: { templeId },
    orderBy: { year: { year: "asc" } },
    select: { rank: true, temple: { select: { name: true } }, year: { select: { year: true } } },
  });
  if (results.length === 0) return null;

  const byRank: Record<number, number> = {};
  for (const result of results) byRank[result.rank] = (byRank[result.rank] ?? 0) + 1;

  return {
    templeName: results[0].temple.name,
    placings: results.length,
    wins: byRank[1] ?? 0,
    byRank,
    firstYear: results[0].year.year,
    lastYear: results[results.length - 1].year.year,
  };
}
