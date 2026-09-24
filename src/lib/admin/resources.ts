export const resourceKeys = ["media", "temples", "boats", "stories", "sections", "patterns", "masters", "processes", "steps", "materials", "tools", "techniques", "sources", "courses", "lessons", "qr-codes"] as const;
export type ResourceKey = (typeof resourceKeys)[number];

export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "checkbox" | "date" | "media" | "hotspot" | "upload" | "relations" | "blocks" | "quiz";
  required?: boolean;
  help?: string;
  optionSource?: "temples" | "boats" | "media" | "processes" | "patterns" | "masters" | "steps" | "materials" | "tools" | "techniques" | "courses";
  options?: Array<{ value: string; label: string }>;
};

export const resources: Record<ResourceKey, { label: string; singular: string; fields: AdminField[] }> = {
  media: { label: "คลังภาพและสื่อ", singular: "ไฟล์สื่อ", fields: [
    { name: "upload", label: "ไฟล์ภาพ", type: "upload", help: "รองรับ JPG PNG WebP ไม่เกิน 25MB — ระบบย่อขนาด แปลงเป็น WebP และลบข้อมูล EXIF รวมถึงพิกัด GPS ให้อัตโนมัติ" },
    { name: "alt", label: "คำบรรยายภาพ", type: "textarea", required: true, help: "อธิบายสิ่งที่เห็นในภาพสำหรับผู้ใช้โปรแกรมอ่านหน้าจอ" },
    { name: "credit", label: "เครดิต / ที่มา" },
    { name: "photographer", label: "ผู้ถ่าย" },
    { name: "takenAt", label: "วันที่ถ่าย", type: "date" },
    { name: "location", label: "สถานที่" },
    { name: "focalX", label: "จุดโฟกัส X (%)", type: "number", help: "จุดที่ต้องคงไว้เมื่อภาพถูกตัดให้พอดีกรอบ เว้นว่างไว้จะใช้กึ่งกลาง" },
    { name: "focalY", label: "จุดโฟกัส Y (%)", type: "number" },
  ] },
  temples: { label: "วัด / ชุมชน", singular: "วัด", fields: [
    { name: "name", label: "ชื่อวัด", required: true }, { name: "slug", label: "Slug", required: true },
    { name: "community", label: "ชุมชน / ที่ตั้ง", required: true },
    { name: "description", label: "คำอธิบาย", type: "textarea" },
  ] },
  boats: { label: "เรือพระ", singular: "เรือพระ", fields: [
    { name: "name", label: "ชื่อเรือ", required: true }, { name: "slug", label: "Slug", required: true },
    { name: "templeId", label: "วัด / ชุมชน", type: "select", optionSource: "temples", required: true },
    { name: "year", label: "พุทธศักราช", type: "number", required: true }, { name: "concept", label: "แนวคิด", required: true },
    { name: "summary", label: "เรื่องย่อ", type: "textarea", required: true }, { name: "competition", label: "ข้อมูลการแข่งขัน" },
    { name: "coverMediaId", label: "ภาพเรือ", type: "media", optionSource: "media" }, { name: "status", label: "สถานะเนื้อหา", type: "select", options: [] },
    { name: "patternIds", label: "ลวดลายบนเรือลำนี้", type: "relations", optionSource: "patterns" },
    { name: "masterIds", label: "ช่างที่ร่วมสร้างเรือลำนี้", type: "relations", optionSource: "masters" },
  ] },
  stories: { label: "เรื่องเล่า", singular: "เรื่องเล่า", fields: [
    { name: "boatId", label: "เรือพระ", type: "select", optionSource: "boats", required: true }, { name: "title", label: "ชื่อเรื่อง", required: true },
    { name: "kind", label: "ประเภทเรื่อง", type: "select", options: [{value:"MAIN",label:"เรื่องหลัก"},{value:"INSPIRATION",label:"แรงบันดาลใจ"},{value:"DESIGN_CONCEPT",label:"แนวคิดการออกแบบ"},{value:"COMMUNITY",label:"เรื่องชุมชน"},{value:"CULTURAL_CONTEXT",label:"บริบทวัฒนธรรม"}] },
    { name: "position", label: "ลำดับ", type: "number", required: true }, { name: "body", label: "เนื้อหา", type: "textarea", required: true },
    { name: "status", label: "สถานะเนื้อหา", type: "select", options: [] },
  ] },
  sections: { label: "จุดสำรวจเรือ", singular: "จุดสำรวจ", fields: [
    { name: "boatId", label: "เรือพระ", type: "select", optionSource: "boats", required: true }, { name: "slug", label: "Slug", required: true },
    { name: "name", label: "ชื่อส่วน", required: true }, { name: "position", label: "ลำดับ", type: "number", required: true },
    { name: "coordinates", label: "ตำแหน่งบนภาพ", type: "hotspot", help: "คลิกหรือลากจุดบนภาพเพื่อกำหนดพิกัด" },
    { name: "x", label: "X (%)", type: "number", required: true }, { name: "y", label: "Y (%)", type: "number", required: true },
    { name: "description", label: "คำอธิบาย", type: "textarea", required: true }, { name: "meaning", label: "ความหมาย", type: "textarea" },
    { name: "closeupMediaId", label: "ภาพระยะใกล้", type: "media", optionSource: "media" }, { name: "status", label: "สถานะเนื้อหา", type: "select", options: [] },
    { name: "patternIds", label: "ลวดลายที่พบในจุดนี้", type: "relations", optionSource: "patterns" },
  ] },
  patterns: { label: "คลังลวดลาย", singular: "ลวดลาย", fields: [
    {name:"name",label:"ชื่อลาย",required:true},{name:"localName",label:"ชื่อท้องถิ่น"},{name:"slug",label:"Slug",required:true},
    {name:"category",label:"หมวด",type:"select",options:[{value:"FLORAL",label:"ดอกไม้"},{value:"FOLIAGE",label:"พรรณพฤกษา"},{value:"GEOMETRIC",label:"เรขาคณิต"},{value:"MYTHICAL",label:"สัตว์หิมพานต์"},{value:"OTHER",label:"อื่น ๆ"}]},
    {name:"characteristics",label:"ลักษณะ",type:"textarea",required:true},{name:"meaning",label:"ความหมาย",type:"textarea"},{name:"historicalNote",label:"บันทึกประวัติ",type:"textarea"},
    {name:"imageMediaId",label:"ภาพลาย",type:"media",optionSource:"media"},{name:"status",label:"สถานะเนื้อหา",type:"select",options:[]},
    {name:"boatIds",label:"เรือที่ใช้ลายนี้",type:"relations",optionSource:"boats"},
    {name:"masterIds",label:"ช่างที่ทำลายนี้",type:"relations",optionSource:"masters"},
    {name:"stepIds",label:"ขั้นตอนที่เกี่ยวข้อง",type:"relations",optionSource:"steps"},
  ] },
  masters: { label: "ช่างผู้สืบสาน", singular: "ช่าง", fields: [
    {name:"name",label:"ชื่อ",required:true},{name:"slug",label:"Slug",required:true},{name:"biography",label:"ประวัติ",type:"textarea",required:true},
    {name:"quote",label:"คำบอกเล่า",type:"textarea"},{name:"practiceSinceYear",label:"เริ่มฝึกงาน พ.ศ.",type:"number"},{name:"portraitMediaId",label:"ภาพบุคคล",type:"media",optionSource:"media"},
    {name:"interviewMediaId",label:"สื่อสัมภาษณ์",type:"media",optionSource:"media"},{name:"status",label:"สถานะเนื้อหา",type:"select",options:[]},
    {name:"expertiseText",label:"ความชำนาญ (หนึ่งบรรทัดต่อหนึ่งเรื่อง)",type:"textarea"},
    {name:"boatIds",label:"เรือที่ร่วมสร้าง",type:"relations",optionSource:"boats"},
    {name:"patternIds",label:"ลวดลายที่ชำนาญ",type:"relations",optionSource:"patterns"},
    {name:"stepIds",label:"ขั้นตอนที่ถ่ายทอด",type:"relations",optionSource:"steps"},
  ] },
  processes: { label: "กระบวนการภูมิปัญญา", singular: "กระบวนการ", fields: [
    {name:"title",label:"ชื่อกระบวนการ",required:true},{name:"slug",label:"Slug",required:true},{name:"description",label:"คำอธิบาย",type:"textarea",required:true},{name:"status",label:"สถานะเนื้อหา",type:"select",options:[]},
  ] },
  steps: { label: "ขั้นตอน", singular: "ขั้นตอน", fields: [
    {name:"processId",label:"กระบวนการ",type:"select",optionSource:"processes",required:true},{name:"title",label:"ชื่อขั้นตอน",required:true},{name:"slug",label:"Slug",required:true},
    {name:"position",label:"ลำดับ",type:"number",required:true},{name:"description",label:"คำอธิบาย",type:"textarea",required:true},{name:"importance",label:"เหตุผลที่สำคัญ",type:"textarea",required:true},
    {name:"instructionsText",label:"วิธีทำ (หนึ่งบรรทัดต่อหนึ่งข้อ)",type:"textarea"},{name:"tips",label:"คำแนะนำจากช่าง",type:"textarea"},{name:"warnings",label:"ข้อควรระวัง",type:"textarea"},
    {name:"coverMediaId",label:"ภาพหลัก",type:"media",optionSource:"media"},{name:"videoMediaId",label:"วิดีโอ",type:"media",optionSource:"media"},{name:"status",label:"สถานะเนื้อหา",type:"select",options:[]},
    {name:"materialIds",label:"วัสดุที่ใช้",type:"relations",optionSource:"materials"},
    {name:"toolIds",label:"เครื่องมือที่ใช้",type:"relations",optionSource:"tools"},
    {name:"techniqueIds",label:"เทคนิคที่เกี่ยวข้อง",type:"relations",optionSource:"techniques"},
    {name:"patternIds",label:"ลวดลายที่เกิดจากขั้นตอนนี้",type:"relations",optionSource:"patterns"},
    {name:"masterIds",label:"ช่างที่สอนขั้นตอนนี้",type:"relations",optionSource:"masters"},
  ] },
  materials: { label: "วัสดุ", singular: "วัสดุ", fields: [{name:"name",label:"ชื่อ",required:true},{name:"slug",label:"Slug",required:true},{name:"description",label:"คำอธิบาย",type:"textarea",required:true}] },
  tools: { label: "เครื่องมือ", singular: "เครื่องมือ", fields: [{name:"name",label:"ชื่อ",required:true},{name:"slug",label:"Slug",required:true},{name:"description",label:"คำอธิบาย",type:"textarea",required:true}] },
  techniques: { label: "เทคนิค", singular: "เทคนิค", fields: [{name:"name",label:"ชื่อ",required:true},{name:"slug",label:"Slug",required:true},{name:"description",label:"คำอธิบาย",type:"textarea",required:true}] },
  sources: { label: "แหล่งองค์ความรู้", singular: "แหล่งข้อมูล", fields: [
    {name:"title",label:"ชื่อแหล่งข้อมูล",required:true},{name:"kind",label:"ประเภท",type:"select",options:[{value:"FIELD_INTERVIEW",label:"สัมภาษณ์ภาคสนาม"},{value:"FIELD_OBSERVATION",label:"สังเกตการณ์"},{value:"PUBLICATION",label:"สิ่งพิมพ์"},{value:"ARCHIVAL_DOCUMENT",label:"เอกสารจดหมายเหตุ"},{value:"DEMO",label:"ข้อมูลสาธิต"}]},
    {name:"informant",label:"ผู้ให้ข้อมูล"},{name:"interviewDate",label:"วันที่สัมภาษณ์",type:"date"},{name:"fieldNote",label:"บันทึกภาคสนาม",type:"textarea"},{name:"citation",label:"การอ้างอิง",type:"textarea"},{name:"status",label:"สถานะเนื้อหา",type:"select",options:[]},
  ] },
  courses: { label: "ชุดบทเรียน", singular: "ชุดบทเรียน", fields: [
    {name:"title",label:"ชื่อชุดบทเรียน",required:true},{name:"slug",label:"Slug",required:true},
    {name:"description",label:"คำอธิบาย",type:"textarea",required:true},
  ] },
  lessons: { label: "บทเรียน", singular: "บทเรียน", fields: [
    {name:"courseId",label:"ชุดบทเรียน",type:"select",optionSource:"courses",required:true},
    {name:"title",label:"ชื่อบท",required:true},{name:"slug",label:"Slug",required:true},
    {name:"position",label:"ลำดับบท",type:"number",required:true},
    {name:"status",label:"สถานะเนื้อหา",type:"select",options:[]},
    {name:"contentsJson",label:"เนื้อหาบทเรียน",type:"blocks",help:"เรียงจากบนลงล่างตามที่ผู้เรียนจะเห็น"},
    {name:"quizJson",label:"แบบฝึกหัดท้ายบท",type:"quiz",help:"เว้นว่างไว้ได้ถ้าบทนี้ไม่มีแบบฝึกหัด"},
  ] },
  "qr-codes": { label: "QR Codes", singular: "QR Code", fields: [
    {name:"code",label:"รหัสสั้น",required:true},{name:"label",label:"ชื่อกำกับ",required:true},{name:"targetKind",label:"ประเภทปลายทาง",type:"select",options:[{value:"BOAT",label:"เรือพระ"},{value:"PATTERN",label:"ลวดลาย"},{value:"MASTER",label:"ช่าง"},{value:"PROCESS",label:"กระบวนการ"},{value:"STEP",label:"ขั้นตอน"}]},
    {name:"targetId",label:"เนื้อหาปลายทาง",type:"select",required:true},{name:"active",label:"เปิดใช้งาน",type:"checkbox"},
  ] },
};

export function isResourceKey(value: string): value is ResourceKey { return resourceKeys.includes(value as ResourceKey); }
