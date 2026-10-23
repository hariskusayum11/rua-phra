import test from "node:test";
import assert from "node:assert/strict";
import { buildPatternHistory, historySchema, historyYearLabel, type PatternHistoryRecord } from "../src/lib/pattern-history";
const pattern = {slug:"p",name:"Pattern",localName:null,isDemo:false,imageMedia:{url:"/current.webp",alt:"Current"}};
function record(id: string, year: number | null): PatternHistoryRecord {return {id,patternSlug:"p",title:id,year,yearEnd:null,approximate:false,image:{url:`/${id}.webp`,alt:id,credit:null},materials:null,tools:null,technique:null,changes:null,source:"test evidence",location:null,verified:false};}
test("history sorts dated evidence and does not infer a date for the archive photograph",()=>{
 const rows=buildPatternHistory([pattern],[record("new",2568),record("old",2540)]);
 assert.deepEqual(rows.map(r=>r.year),[2540,2568,null]);
 assert.equal(historyYearLabel(rows[2]),"ยังไม่ทราบปี");
});
test("recorded image replaces undated fallback; demo and unrelated records stay out",()=>{
 const r=record("source",2550);r.image.url="/current.webp";
 assert.equal(buildPatternHistory([pattern],[r]).length,1);
 assert.equal(buildPatternHistory([{...pattern,isDemo:true}],[r]).length,0);
 assert.equal(buildPatternHistory([],[r]).length,0);
});
test("schema rejects backwards date ranges and duplicate identifiers",()=>{
 const r=record("r",2550);assert.equal(historySchema.safeParse([{...r,yearEnd:2540}]).success,false);
 assert.equal(historySchema.safeParse([r,r]).success,false);
 assert.equal(historyYearLabel({...r,yearEnd:2560,approximate:true}),"ประมาณ พ.ศ. 2550–2560");
});
