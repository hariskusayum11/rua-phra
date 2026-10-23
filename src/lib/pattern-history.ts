import { z } from "zod";
import history from "@/data/pattern-history.json";

export const historySchema = z.array(z.object({
  id: z.string().min(1), patternSlug: z.string().min(1), title: z.string().min(1),
  year: z.number().int().min(2000).max(3000).nullable(),
  yearEnd: z.number().int().min(2000).max(3000).nullable().default(null),
  approximate: z.boolean().default(false),
  image: z.object({ url: z.string().startsWith("/").refine(v=>!v.startsWith("//")), alt: z.string().min(1), credit: z.string().nullable().default(null) }),
  materials: z.string().nullable(), tools: z.string().nullable(), technique: z.string().nullable(), changes: z.string().nullable(),
  source: z.string().min(1), location: z.string().nullable(), verified: z.boolean(),
}).refine(r=>r.yearEnd === null || (r.year !== null && r.yearEnd >= r.year), {message:"ช่วงปีสิ้นสุดต้องไม่ก่อนปีเริ่มต้น"})).refine(rows=>new Set(rows.map(r=>r.id)).size===rows.length,{message:"id ต้องไม่ซ้ำกัน"});
export type PatternHistoryRecord = z.infer<typeof historySchema>[number];
export type TimelinePattern = { slug: string; name: string; localName: string | null; isDemo: boolean; imageMedia: {url: string | null; alt: string; credit?: string | null} | null };
export function historyYearLabel(row: Pick<PatternHistoryRecord,"year"|"yearEnd"|"approximate">) {
  if (row.year === null) return "ยังไม่ทราบปี";
  return `${row.approximate ? "ประมาณ " : ""}พ.ศ. ${row.year}${row.yearEnd ? `–${row.yearEnd}` : ""}`;
}
export function buildPatternHistory(patterns: TimelinePattern[], recorded: PatternHistoryRecord[] = historySchema.parse(history)) {
  const allowed = new Set(patterns.filter(p=>!p.isDemo).map(p=>p.slug));
  const rows = recorded.filter(r=>allowed.has(r.patternSlug));
  // Existing archive photographs have no capture year. Never infer it from a boat year or upload date.
  for (const p of patterns) {
    if (p.isDemo || !p.imageMedia?.url || rows.some(r=>r.patternSlug===p.slug && r.image.url===p.imageMedia!.url)) continue;
    rows.push({id:`archive:${p.slug}`,patternSlug:p.slug,title:p.localName || p.name,year:null,yearEnd:null,approximate:false,image:{url:p.imageMedia.url,alt:p.imageMedia.alt,credit:p.imageMedia.credit??null},materials:null,tools:null,technique:null,changes:null,source:"ภาพจากรายการลวดลายในคลัง · ยังไม่ยืนยันช่วงเวลาของภาพ",location:null,verified:false});
  }
  return rows.sort((a,b)=>(a.year??Infinity)-(b.year??Infinity)||a.title.localeCompare(b.title,"th"));
}
