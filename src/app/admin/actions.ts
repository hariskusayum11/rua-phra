"use server";

import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { getDb } from "@/lib/db";
import { isResourceKey, type ResourceKey } from "@/lib/admin/resources";
import { adminSchemas, type ActionState } from "@/lib/validations/admin";
import { relationsFor } from "@/lib/admin/relations";
import { lessonBlocks, lessonQuiz, parseJsonField } from "@/lib/learning/authoring";

async function adminUser() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHORIZED");
  const user = await getDb().user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

function failure(error: unknown): ActionState {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return { ok: false, message: "ข้อมูลซ้ำกับรายการที่มีอยู่แล้ว" };
    if (error.code === "P2003") return { ok: false, message: "ลบไม่ได้เพราะยังมีข้อมูลอื่นเชื่อมโยงอยู่" };
    if (error.code === "P2025") return { ok: false, message: "ไม่พบรายการ หรือรายการถูกแก้ไขไปแล้ว" };
  }
  return { ok: false, message: "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง" };
}

async function setVerification(target: "boat"|"story"|"section"|"pattern"|"master"|"process"|"step"|"source"|"lesson", id: string, status: string, userId: string) {
  const reviewed = status === "VERIFIED" || status === "PUBLISHED";
  const relation = `${target}Id`;
  await getDb().contentVerification.upsert({
    where: { [relation]: id } as never,
    update: { status: status as never, verifiedById: reviewed ? userId : null, verifiedAt: reviewed ? new Date() : null },
    create: { [relation]: id, status, verifiedById: reviewed ? userId : null, verifiedAt: reviewed ? new Date() : null } as never,
  });
}

/**
 * Brings a resource's join rows in line with what the form posted: add what is newly
 * ticked, remove what was unticked, leave the rest alone. Deleting and recreating the lot
 * would churn createdAt on links nobody touched.
 */
async function syncRelations(resource: ResourceKey, id: string, values: Record<string, unknown>) {
  const db = getDb();
  for (const relation of relationsFor(resource)) {
    const wanted = new Set((values[relation.field] as string[] | undefined) ?? []);
    const model = db[relation.model] as unknown as {
      findMany: (args: unknown) => Promise<Record<string, string>[]>;
      deleteMany: (args: unknown) => Promise<unknown>;
      createMany: (args: unknown) => Promise<unknown>;
    };
    const existing = await model.findMany({ where: { [relation.self]: id }, select: { [relation.other]: true } });
    const current = new Set(existing.map((row) => row[relation.other]));

    const removed = [...current].filter((value) => !wanted.has(value));
    if (removed.length > 0) {
      await model.deleteMany({ where: { [relation.self]: id, [relation.other]: { in: removed } } });
    }
    const added = [...wanted].filter((value) => !current.has(value));
    if (added.length > 0) {
      await model.createMany({
        data: added.map((value) => ({ [relation.self]: id, [relation.other]: value })),
        skipDuplicates: true,
      });
    }
  }
}

/** A master's areas of expertise are free text, one per line. */
async function syncExpertise(masterId: string, text: string) {
  const db = getDb();
  const titles = [...new Set(text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
  // notIn on an empty list matches nothing, so an empty box would otherwise keep every row.
  await db.masterExpertise.deleteMany({
    where: titles.length > 0 ? { masterId, title: { notIn: titles } } : { masterId },
  });
  for (const title of titles) {
    await db.masterExpertise.upsert({
      where: { masterId_title: { masterId, title } },
      update: {},
      create: { masterId, title },
    });
  }
}

export async function saveResource(resource: ResourceKey, id: string | null, values: unknown): Promise<ActionState> {
  try {
    const user = await adminUser();
    if (!isResourceKey(resource)) return { ok: false, message: "ไม่รู้จักประเภทข้อมูล" };
    const parsed = adminSchemas[resource].safeParse(values);
    if (!parsed.success) return { ok: false, message: "ข้อมูลยังไม่ครบหรือรูปแบบไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors as Record<string,string[]> };
    const db = getDb();
    let savedId = id;

    switch (resource) {
      case "media": {
        const { takenAt, ...raw } = adminSchemas.media.parse(values);
        const data = {
          ...raw,
          takenAt: takenAt ? new Date(`${takenAt}T00:00:00Z`) : null,
          kind: "IMAGE" as const,
          provider: "LOCAL" as const,
          url: raw.url ?? null,
          storageKey: raw.storageKey ?? null,
          mimeType: raw.mimeType ?? "image/webp",
          width: raw.width ?? null,
          height: raw.height ?? null,
          focalX: raw.focalX ?? null,
          focalY: raw.focalY ?? null,
        };
        if (!id && !data.url) return { ok: false, message: "กรุณาอัปโหลดไฟล์ภาพก่อนบันทึก" };
        // An edit that uploaded nothing keeps the file it already had.
        const { url, storageKey, width, height, mimeType, ...rest } = data;
        const row = id
          ? await db.media.update({ where: { id }, data: url ? data : rest })
          : await db.media.create({ data: { ...rest, url, storageKey, width, height, mimeType } });
        savedId = row.id;
        break;
      }
      case "temples": { const data = adminSchemas.temples.parse(values); const row = id ? await db.temple.update({where:{id},data}) : await db.temple.create({data}); savedId=row.id; break; }
      case "boats": { const { status, patternIds, masterIds, ...data } = adminSchemas.boats.parse(values); const row = id ? await db.boat.update({where:{id},data}) : await db.boat.create({data}); savedId=row.id; await setVerification("boat",row.id,status,user.id); break; }
      case "stories": { const { status, ...data } = adminSchemas.stories.parse(values); const row=id?await db.boatStory.update({where:{id},data}):await db.boatStory.create({data});savedId=row.id;await setVerification("story",row.id,status,user.id);break; }
      case "sections": { const { status, patternIds, ...data } = adminSchemas.sections.parse(values); const row=id?await db.boatSection.update({where:{id},data}):await db.boatSection.create({data});savedId=row.id;await setVerification("section",row.id,status,user.id);break; }
      case "patterns": { const { status, boatIds, masterIds, stepIds, ...data } = adminSchemas.patterns.parse(values); const row=id?await db.pattern.update({where:{id},data}):await db.pattern.create({data});savedId=row.id;await setVerification("pattern",row.id,status,user.id);break; }
      case "masters": { const { status, expertiseText, boatIds, patternIds, stepIds, ...data } = adminSchemas.masters.parse(values); const row=id?await db.master.update({where:{id},data}):await db.master.create({data});savedId=row.id;await setVerification("master",row.id,status,user.id);await syncExpertise(row.id,expertiseText);break; }
      case "processes": { const { status, ...data } = adminSchemas.processes.parse(values); const row=id?await db.knowledgeProcess.update({where:{id},data}):await db.knowledgeProcess.create({data});savedId=row.id;await setVerification("process",row.id,status,user.id);break; }
      case "steps": {
        const { status, instructionsText, materialIds, toolIds, techniqueIds, patternIds, masterIds, ...data } = adminSchemas.steps.parse(values);
        const instructions = instructionsText.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map((text,index)=>({order:index+1,text}));
        const row=id?await db.processStep.update({where:{id},data:{...data,instructions}}):await db.processStep.create({data:{...data,instructions}});
        savedId=row.id;await setVerification("step",row.id,status,user.id);break;
      }
      case "materials": { const data=adminSchemas.materials.parse(values);const row=id?await db.material.update({where:{id},data}):await db.material.create({data});savedId=row.id;break; }
      case "tools": { const data=adminSchemas.tools.parse(values);const row=id?await db.tool.update({where:{id},data}):await db.tool.create({data});savedId=row.id;break; }
      case "techniques": { const data=adminSchemas.techniques.parse(values);const row=id?await db.technique.update({where:{id},data}):await db.technique.create({data});savedId=row.id;break; }
      case "sources": { const {status,...raw}=adminSchemas.sources.parse(values); const data={...raw,interviewDate:raw.interviewDate?new Date(`${raw.interviewDate}T00:00:00Z`):null};const row=id?await db.knowledgeSource.update({where:{id},data}):await db.knowledgeSource.create({data});savedId=row.id;await setVerification("source",row.id,status,user.id);break; }
      case "courses": { const data=adminSchemas.courses.parse(values); const row=id?await db.course.update({where:{id},data}):await db.course.create({data}); savedId=row.id; break; }
      case "lessons": {
        // Lesson has no isDemo column of its own — a lesson is demo because its course is.
        const { status, contentsJson, quizJson, isDemo: _isDemo, ...data } = adminSchemas.lessons.parse(values);
        const blocks = lessonBlocks.safeParse(parseJsonField(contentsJson) ?? []);
        if (!blocks.success) return { ok: false, message: "เนื้อหาบทเรียนยังไม่ถูกต้อง", fieldErrors: { contentsJson: blocks.error.issues.map(i=>i.message) } };
        const quizRaw = parseJsonField(quizJson);
        const quiz = lessonQuiz.safeParse(quizRaw ?? null);
        if (!quiz.success) return { ok: false, message: "แบบฝึกหัดยังไม่ถูกต้อง", fieldErrors: { quizJson: quiz.error.issues.map(i=>i.message) } };

        const row = id ? await db.lesson.update({where:{id},data}) : await db.lesson.create({data});
        savedId = row.id;

        // Blocks and questions have no identity of their own that an editor ever sees, so
        // they are replaced wholesale. Progress and attempts hang off the lesson, not these,
        // so nothing a learner did is lost by rewriting them.
        await db.lessonContent.deleteMany({ where: { lessonId: row.id } });
        if (blocks.data.length > 0) {
          await db.lessonContent.createMany({
            data: blocks.data.map((block, index) => ({ lessonId: row.id, kind: block.kind, body: block.body, position: index + 1 })),
          });
        }
        await db.quiz.deleteMany({ where: { lessonId: row.id } });
        if (quiz.data) {
          const createdQuiz = await db.quiz.create({ data: { lessonId: row.id, title: quiz.data.title } });
          for (const [index, question] of quiz.data.questions.entries()) {
            await db.question.create({
              data: {
                quizId: createdQuiz.id, type: question.type, prompt: question.prompt, position: index + 1,
                choices: { create: question.choices.map((choice) => ({ text: choice.text, correct: choice.correct })) },
              },
            });
          }
        }
        await setVerification("lesson", row.id, status, user.id);
        break;
      }
      case "qr-codes": {
        const raw=adminSchemas["qr-codes"].parse(values);
        const target = { boatId:null,patternId:null,masterId:null,processId:null,stepId:null };
        const key = ({BOAT:"boatId",PATTERN:"patternId",MASTER:"masterId",PROCESS:"processId",STEP:"stepId"} as const)[raw.targetKind];
        const data={ code:raw.code,label:raw.label,targetKind:raw.targetKind,active:raw.active,isDemo:raw.isDemo,...target,[key]:raw.targetId };
        const row=id?await db.qRCode.update({where:{id},data}):await db.qRCode.create({data});savedId=row.id;break;
      }
    }
    if (savedId) await syncRelations(resource, savedId, parsed.data as Record<string, unknown>);
    revalidatePath("/admin"); revalidatePath(`/admin/${resource}`); revalidatePath("/", "page"); revalidatePath("/boats", "layout"); revalidatePath("/craft", "layout"); revalidatePath("/learn", "layout");
    return { ok: true, message: id ? "บันทึกการแก้ไขแล้ว" : "สร้างรายการแล้ว", id: savedId ?? undefined };
  } catch (error) { console.error("Admin save failed", error); return failure(error); }
}

export async function deleteResource(resource: ResourceKey, id: string): Promise<ActionState> {
  try {
    await adminUser(); const db=getDb();
    switch(resource) {
      case "media": await db.media.delete({where:{id}});break;
      case "temples": await db.temple.delete({where:{id}});break;
      case "boats": await db.boat.delete({where:{id}});break; case "stories":await db.boatStory.delete({where:{id}});break;
      case "sections":await db.boatSection.delete({where:{id}});break; case "patterns":await db.pattern.delete({where:{id}});break;
      case "masters":await db.master.delete({where:{id}});break; case "processes":await db.knowledgeProcess.delete({where:{id}});break;
      case "steps":await db.processStep.delete({where:{id}});break; case "materials":await db.material.delete({where:{id}});break;
      case "tools":await db.tool.delete({where:{id}});break; case "techniques":await db.technique.delete({where:{id}});break;
      case "sources":await db.knowledgeSource.delete({where:{id}});break; case "qr-codes":await db.qRCode.delete({where:{id}});break;
      case "courses":await db.course.delete({where:{id}});break; case "lessons":await db.lesson.delete({where:{id}});break;
    }
    revalidatePath(`/admin/${resource}`); return {ok:true,message:"ลบรายการแล้ว"};
  } catch(error) { console.error("Admin delete failed",error); return failure(error); }
}

export async function logoutAction() { await signOut({ redirectTo: "/login" }); }
