export type PatternPath = { id: string; d: string; group: string; motif: string; color: string | null };
export type CreatePattern = {
  id: string; originalId: string; name_th: string; category: string; originalCategory: string;
  svg: string; viewBox: string; width: number; height: number;
  outlines: {id: string; d: string; motif: string}[];
  holes: PatternPath[]; groups: Record<string,string[]>; hasCraftColors: boolean; foil: string | null;
  credit: string; source: string; sourceNote: string; sourcePage: number | null; sourceGroup: string;
  meaning: string; difficulty: "ง่าย" | "กลาง" | "ยาก"; sourceHash: string;
};
export type PatternSummary = Omit<CreatePattern,"svg"|"outlines"|"holes"|"groups"> & {
  holeCount: number; groupCount: number; thumbnail: string; dataUrl: string;
};
