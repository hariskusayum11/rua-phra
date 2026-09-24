import { z } from "zod";
import type { ResourceKey } from "@/lib/admin/resources";

const text = z.string().trim().min(1, "กรุณากรอกข้อมูล").max(5000);
const emptyToUndefined = (value: unknown) => value == null || value === "" ? undefined : value;
const optionalText = z.preprocess(emptyToUndefined, z.string().trim().max(5000).optional());
const slug = z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ใช้ตัวพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น");
const uuid = z.string().uuid("กรุณาเลือกรายการ");
const optionalUuid = z.preprocess((value) => value == null || value === "" ? null : value, z.string().uuid().nullable());
const positiveInt = z.coerce.number().int().min(1);
const status = z.enum(["DRAFT", "PENDING_REVIEW", "REVISION_REQUIRED", "VERIFIED", "PUBLISHED"]);
const commonDemo = { isDemo: z.boolean().default(false) };
/** A relation picker posts a list of ids; an untouched picker posts nothing at all. */
const relationIds = z.preprocess(
  (value) => (value == null || value === "" ? [] : Array.isArray(value) ? value : [value]),
  z.array(z.string().uuid()).default([]),
);
const percent = z.preprocess(emptyToUndefined, z.coerce.number().min(0).max(100).optional());

export const adminSchemas = {
  media: z.object({
    alt: text,
    credit: optionalText, photographer: optionalText, location: optionalText,
    takenAt: z.preprocess(emptyToUndefined, z.string().optional()),
    focalX: percent, focalY: percent,
    // Filled by the upload control, not typed by hand.
    url: z.preprocess(emptyToUndefined, z.string().optional()),
    storageKey: z.preprocess(emptyToUndefined, z.string().optional()),
    mimeType: z.preprocess(emptyToUndefined, z.string().optional()),
    width: z.preprocess(emptyToUndefined, z.coerce.number().int().optional()),
    height: z.preprocess(emptyToUndefined, z.coerce.number().int().optional()),
    ...commonDemo,
  }),
  temples: z.object({ name:text, slug, community:text, description:optionalText, ...commonDemo }),
  boats: z.object({ name:text,slug,templeId:uuid,year:z.coerce.number().int().min(2400).max(3000),concept:text,summary:text,competition:optionalText,coverMediaId:optionalUuid,status,patternIds:relationIds,masterIds:relationIds,...commonDemo }),
  stories: z.object({ boatId:uuid,title:text,kind:z.enum(["MAIN","INSPIRATION","DESIGN_CONCEPT","COMMUNITY","CULTURAL_CONTEXT"]),position:positiveInt,body:text,status,...commonDemo }),
  sections: z.object({ boatId:uuid,slug,name:text,position:positiveInt,x:z.coerce.number().min(0).max(100),y:z.coerce.number().min(0).max(100),description:text,meaning:optionalText,closeupMediaId:optionalUuid,status,patternIds:relationIds,...commonDemo }),
  patterns: z.object({ name:text,localName:optionalText,slug,category:z.enum(["FLORAL","FOLIAGE","GEOMETRIC","MYTHICAL","OTHER"]),characteristics:text,meaning:optionalText,historicalNote:optionalText,imageMediaId:optionalUuid,status,boatIds:relationIds,masterIds:relationIds,stepIds:relationIds,...commonDemo }),
  masters: z.object({ name:text,slug,biography:text,quote:optionalText,practiceSinceYear:z.preprocess(emptyToUndefined,z.coerce.number().int().min(2400).max(3000).optional()),portraitMediaId:optionalUuid,interviewMediaId:optionalUuid,status,expertiseText:z.string().max(2000).default(""),boatIds:relationIds,patternIds:relationIds,stepIds:relationIds,...commonDemo }),
  processes: z.object({ title:text,slug,description:text,status,...commonDemo }),
  steps: z.object({ processId:uuid,title:text,slug,position:positiveInt,description:text,importance:text,instructionsText:z.string().max(10000),tips:optionalText,warnings:optionalText,coverMediaId:optionalUuid,videoMediaId:optionalUuid,status,materialIds:relationIds,toolIds:relationIds,techniqueIds:relationIds,patternIds:relationIds,masterIds:relationIds,...commonDemo }),
  materials: z.object({ name:text,slug,description:text,...commonDemo }),
  tools: z.object({ name:text,slug,description:text,...commonDemo }),
  techniques: z.object({ name:text,slug,description:text,...commonDemo }),
  sources: z.object({ title:text,kind:z.enum(["FIELD_INTERVIEW","FIELD_OBSERVATION","PUBLICATION","ARCHIVAL_DOCUMENT","DEMO"]),informant:optionalText,interviewDate:z.preprocess(emptyToUndefined,z.string().optional()),fieldNote:optionalText,citation:optionalText,status,...commonDemo }),
  "qr-codes": z.object({ code:z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9-]+$/),label:text,targetKind:z.enum(["BOAT","PATTERN","MASTER","PROCESS","STEP"]),targetId:uuid,active:z.boolean().default(false),...commonDemo }),
} satisfies Record<ResourceKey, z.ZodType>;

export type ActionState = { ok: boolean; message: string; fieldErrors?: Record<string,string[]>; id?: string };
