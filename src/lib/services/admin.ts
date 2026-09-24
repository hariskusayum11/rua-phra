import "server-only";
import { getDb } from "@/lib/db";
import type { ResourceKey } from "@/lib/admin/resources";
import { parseInstructions } from "@/lib/services/craft";
import { relationsFor } from "@/lib/admin/relations";

export type AdminListRow = { id: string; title: string; detail: string; status?: string; updatedAt: Date };
export type AdminOption = { value: string; label: string; imageUrl?: string | null; kind?: string };

export async function getAdminList(resource: ResourceKey): Promise<AdminListRow[]> {
  const db=getDb();
  switch(resource) {
    case "media": return (await db.media.findMany({orderBy:{createdAt:"desc"},take:300})).map(x=>({id:x.id,title:x.alt,detail:[x.kind,x.width&&x.height?`${x.width}×${x.height}`:null,x.photographer].filter(Boolean).join(" · "),status:x.url?"READY":"NO FILE",updatedAt:x.updatedAt}));
    case "temples": return (await db.temple.findMany({orderBy:{name:"asc"},include:{_count:{select:{boats:true}}}})).map(x=>({id:x.id,title:x.name,detail:`${x.community} · เรือ ${x._count.boats} ลำ`,updatedAt:x.updatedAt}));
    case "boats": return (await db.boat.findMany({orderBy:{updatedAt:"desc"},include:{temple:true,verification:true}})).map(x=>({id:x.id,title:x.name,detail:`${x.temple.name} · พ.ศ. ${x.year}`,status:x.verification?.status??"DRAFT",updatedAt:x.updatedAt}));
    case "stories": return (await db.boatStory.findMany({orderBy:{updatedAt:"desc"},include:{boat:true,verification:true}})).map(x=>({id:x.id,title:x.title,detail:x.boat.name,status:x.verification?.status??"DRAFT",updatedAt:x.updatedAt}));
    case "sections": return (await db.boatSection.findMany({orderBy:{updatedAt:"desc"},include:{boat:true,verification:true}})).map(x=>({id:x.id,title:x.name,detail:`${x.boat.name} · X ${x.x.toFixed(1)}% / Y ${x.y.toFixed(1)}%`,status:x.verification?.status??"DRAFT",updatedAt:x.updatedAt}));
    case "patterns": return (await db.pattern.findMany({orderBy:{updatedAt:"desc"},include:{verification:true}})).map(x=>({id:x.id,title:x.name,detail:x.category,status:x.verification?.status??"DRAFT",updatedAt:x.updatedAt}));
    case "masters": return (await db.master.findMany({orderBy:{updatedAt:"desc"},include:{verification:true}})).map(x=>({id:x.id,title:x.name,detail:x.slug,status:x.verification?.status??"DRAFT",updatedAt:x.updatedAt}));
    case "processes": return (await db.knowledgeProcess.findMany({orderBy:{updatedAt:"desc"},include:{verification:true,_count:{select:{steps:true}}}})).map(x=>({id:x.id,title:x.title,detail:`${x._count.steps} ขั้นตอน`,status:x.verification?.status??"DRAFT",updatedAt:x.updatedAt}));
    case "steps": return (await db.processStep.findMany({orderBy:{updatedAt:"desc"},include:{process:true,verification:true}})).map(x=>({id:x.id,title:x.title,detail:`${x.process.title} · ขั้น ${x.position}`,status:x.verification?.status??"DRAFT",updatedAt:x.updatedAt}));
    case "materials": return (await db.material.findMany({orderBy:{updatedAt:"desc"}})).map(x=>({id:x.id,title:x.name,detail:x.slug,updatedAt:x.updatedAt}));
    case "tools": return (await db.tool.findMany({orderBy:{updatedAt:"desc"}})).map(x=>({id:x.id,title:x.name,detail:x.slug,updatedAt:x.updatedAt}));
    case "techniques": return (await db.technique.findMany({orderBy:{updatedAt:"desc"}})).map(x=>({id:x.id,title:x.name,detail:x.slug,updatedAt:x.updatedAt}));
    case "sources": return (await db.knowledgeSource.findMany({orderBy:{updatedAt:"desc"},include:{verification:true}})).map(x=>({id:x.id,title:x.title,detail:x.informant||x.kind,status:x.verification?.status??"DRAFT",updatedAt:x.updatedAt}));
    case "courses": return (await db.course.findMany({orderBy:{updatedAt:"desc"},include:{_count:{select:{lessons:true}}}})).map(x=>({id:x.id,title:x.title,detail:`${x._count.lessons} บทเรียน · /learn/${x.slug}`,updatedAt:x.updatedAt}));
    case "lessons": return (await db.lesson.findMany({orderBy:[{course:{title:"asc"}},{position:"asc"}],include:{course:true,verification:true,_count:{select:{contents:true,quizzes:true}}}})).map(x=>({id:x.id,title:`${x.position}. ${x.title}`,detail:`${x.course.title} · ${x._count.contents} ส่วน${x._count.quizzes>0?" · มีแบบฝึกหัด":""}`,status:x.verification?.status??"DRAFT",updatedAt:x.updatedAt}));
    case "qr-codes": return (await db.qRCode.findMany({orderBy:{updatedAt:"desc"}})).map(x=>({id:x.id,title:x.label,detail:`/q/${x.code} · ${x.targetKind} · ${x.scanCount} scans`,status:x.active?"ACTIVE":"INACTIVE",updatedAt:x.updatedAt}));
  }
}

export async function getAdminRecord(resource: ResourceKey, id: string): Promise<Record<string, unknown> | null> {
  const db=getDb(); let row: Record<string,unknown>|null=null;
  switch(resource) {
    case "media": row=await db.media.findUnique({where:{id}});break;
    case "temples": row=await db.temple.findUnique({where:{id}});break;
    case "boats": row=await db.boat.findUnique({where:{id},include:{verification:true}});break;
    case "stories": row=await db.boatStory.findUnique({where:{id},include:{verification:true}});break;
    case "sections": row=await db.boatSection.findUnique({where:{id},include:{verification:true}});break;
    case "patterns": row=await db.pattern.findUnique({where:{id},include:{verification:true}});break;
    case "masters": row=await db.master.findUnique({where:{id},include:{verification:true}});break;
    case "processes": row=await db.knowledgeProcess.findUnique({where:{id},include:{verification:true}});break;
    case "steps": row=await db.processStep.findUnique({where:{id},include:{verification:true}});break;
    case "materials": row=await db.material.findUnique({where:{id}});break;
    case "tools": row=await db.tool.findUnique({where:{id}});break;
    case "techniques": row=await db.technique.findUnique({where:{id}});break;
    case "sources": row=await db.knowledgeSource.findUnique({where:{id},include:{verification:true}});break;
    case "courses": row=await db.course.findUnique({where:{id}});break;
    case "lessons": row=await db.lesson.findUnique({where:{id},include:{verification:true}});break;
    case "qr-codes": row=await db.qRCode.findUnique({where:{id}});break;
  }
  if(!row)return null;
  const verification=row.verification as {status?:string}|undefined;
  const result: Record<string,unknown>={...row,status:verification?.status??"DRAFT",isDemo:Boolean(row.isDemo)};
  delete result.verification;
  if(resource==="steps") result.instructionsText=parseInstructions(row.instructions).map(x=>x.text).join("\n");
  if(resource==="sources" && row.interviewDate instanceof Date) result.interviewDate=row.interviewDate.toISOString().slice(0,10);
  if(resource==="qr-codes") {
    result.targetId=(row.boatId||row.patternId||row.masterId||row.processId||row.stepId||"") as string;
  }
  if(resource==="media" && row.takenAt instanceof Date) result.takenAt=row.takenAt.toISOString().slice(0,10);
  if(resource==="lessons") {
    // The editor works on JSON, so the stored rows are handed back in the same shape they
    // were posted in — including the answer key, which an editor is allowed to see.
    const contents=await db.lessonContent.findMany({where:{lessonId:id},orderBy:{position:"asc"},select:{kind:true,body:true}});
    result.contentsJson=JSON.stringify(contents.map(x=>({kind:x.kind,body:x.body})));
    const quiz=await db.quiz.findFirst({where:{lessonId:id},orderBy:{createdAt:"asc"},select:{title:true,questions:{orderBy:{position:"asc"},select:{type:true,prompt:true,choices:{orderBy:{createdAt:"asc"},select:{text:true,correct:true}}}}}});
    result.quizJson=quiz?JSON.stringify(quiz):"";
  }
  if(resource==="masters") {
    const expertise=await db.masterExpertise.findMany({where:{masterId:id},orderBy:{title:"asc"},select:{title:true}});
    result.expertiseText=expertise.map(x=>x.title).join("\n");
  }
  // Load whatever is already linked, so the pickers open showing the current state.
  for(const relation of relationsFor(resource)) {
    const model=db[relation.model] as unknown as { findMany:(args:unknown)=>Promise<Record<string,string>[]> };
    const rows=await model.findMany({where:{[relation.self]:id},select:{[relation.other]:true}});
    result[relation.field]=rows.map(x=>x[relation.other]);
  }
  return result;
}

export async function getAdminOptions() {
  const db=getDb(); const [temples,boats,media,processes,patterns,masters,steps,materials,tools,techniques,courses]=await Promise.all([
    db.temple.findMany({orderBy:{name:"asc"},select:{id:true,name:true}}),
    db.boat.findMany({orderBy:[{name:"asc"},{year:"desc"}],select:{id:true,name:true,year:true,coverMedia:{select:{url:true}}}}),
    db.media.findMany({orderBy:{createdAt:"desc"},select:{id:true,alt:true,url:true,kind:true}}),
    db.knowledgeProcess.findMany({orderBy:{title:"asc"},select:{id:true,title:true}}),
    db.pattern.findMany({orderBy:{name:"asc"},select:{id:true,name:true}}),
    db.master.findMany({orderBy:{name:"asc"},select:{id:true,name:true}}),
    db.processStep.findMany({orderBy:[{processId:"asc"},{position:"asc"}],select:{id:true,slug:true,title:true,position:true,process:{select:{title:true}}}}),
    db.material.findMany({orderBy:{name:"asc"},select:{id:true,name:true}}),
    db.tool.findMany({orderBy:{name:"asc"},select:{id:true,name:true}}),
    db.technique.findMany({orderBy:{name:"asc"},select:{id:true,name:true}}),
    db.course.findMany({orderBy:{title:"asc"},select:{id:true,title:true}}),
  ]);
  return {
    temples:temples.map(x=>({value:x.id,label:x.name})), boats:boats.map(x=>({value:x.id,label:`${x.name} · พ.ศ. ${x.year}`,imageUrl:x.coverMedia?.url})),
    media:media.map(x=>({value:x.id,label:x.alt,imageUrl:x.url,kind:x.kind})), processes:processes.map(x=>({value:x.id,label:x.title})),
    patterns:patterns.map(x=>({value:x.id,label:x.name,kind:"PATTERN"})), masters:masters.map(x=>({value:x.id,label:x.name,kind:"MASTER"})),
    steps:steps.map(x=>({value:x.id,label:`${String(x.position).padStart(2,"0")} ${x.title}`,kind:"STEP"})),
    // Lesson blocks point at a step by slug, not by id, so the link keeps working if the
    // block is copied into another lesson or exported.
    stepSlugs:steps.map(x=>({value:x.slug,label:`${String(x.position).padStart(2,"0")} ${x.title}`,kind:"STEP"})),
    materials:materials.map(x=>({value:x.id,label:x.name})),
    tools:tools.map(x=>({value:x.id,label:x.name})),
    techniques:techniques.map(x=>({value:x.id,label:x.name})),
    courses:courses.map(x=>({value:x.id,label:x.title})),
  } satisfies Record<string,AdminOption[]>;
}

export async function getAdminCounts() {
  const db=getDb(); const values=await Promise.all([db.boat.count(),db.boatSection.count(),db.pattern.count(),db.master.count(),db.knowledgeProcess.count(),db.knowledgeSource.count(),db.qRCode.count(),db.media.count(),db.temple.count()]);
  return values;
}
