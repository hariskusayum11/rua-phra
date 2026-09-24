import type { ResourceKey } from "@/lib/admin/resources";

/**
 * The join tables an editor can manage from a resource's own form.
 *
 * Every relation here is a plain many-to-many with no meaning of its own beyond "these two
 * belong together", so one declarative table can drive the form control, the record loader
 * and the save. Joins that carry their own information — a master's contribution to a boat,
 * the quantity of a material in a step — are deliberately absent: those deserve their own
 * editor rather than a checkbox that silently discards the note.
 *
 * `field` is what the form posts. `model` is the Prisma delegate. `self` and `other` are the
 * two foreign keys on the join row.
 */
export type RelationSpec = {
  field: string;
  label: string;
  help?: string;
  /** Which option list the checkboxes come from. */
  optionSource: "boats" | "patterns" | "masters" | "steps" | "materials" | "tools" | "techniques";
  model: "boatPattern" | "boatSectionPattern" | "masterPattern" | "masterBoat" | "masterStep" | "patternStep" | "stepMaterial" | "stepTool" | "stepTechnique";
  self: string;
  other: string;
};

export const relationsByResource: Partial<Record<ResourceKey, RelationSpec[]>> = {
  boats: [
    { field: "patternIds", label: "ลวดลายบนเรือลำนี้", optionSource: "patterns", model: "boatPattern", self: "boatId", other: "patternId" },
    { field: "masterIds", label: "ช่างที่ร่วมสร้างเรือลำนี้", optionSource: "masters", model: "masterBoat", self: "boatId", other: "masterId" },
  ],
  sections: [
    { field: "patternIds", label: "ลวดลายที่พบในจุดนี้", optionSource: "patterns", model: "boatSectionPattern", self: "sectionId", other: "patternId" },
  ],
  patterns: [
    { field: "boatIds", label: "เรือที่ใช้ลายนี้", optionSource: "boats", model: "boatPattern", self: "patternId", other: "boatId" },
    { field: "masterIds", label: "ช่างที่ทำลายนี้", optionSource: "masters", model: "masterPattern", self: "patternId", other: "masterId" },
    { field: "stepIds", label: "ขั้นตอนที่เกี่ยวข้อง", optionSource: "steps", model: "patternStep", self: "patternId", other: "stepId" },
  ],
  masters: [
    { field: "boatIds", label: "เรือที่ร่วมสร้าง", optionSource: "boats", model: "masterBoat", self: "masterId", other: "boatId" },
    { field: "patternIds", label: "ลวดลายที่ชำนาญ", optionSource: "patterns", model: "masterPattern", self: "masterId", other: "patternId" },
    { field: "stepIds", label: "ขั้นตอนที่ถ่ายทอด", optionSource: "steps", model: "masterStep", self: "masterId", other: "stepId" },
  ],
  steps: [
    { field: "materialIds", label: "วัสดุที่ใช้", optionSource: "materials", model: "stepMaterial", self: "stepId", other: "materialId" },
    { field: "toolIds", label: "เครื่องมือที่ใช้", optionSource: "tools", model: "stepTool", self: "stepId", other: "toolId" },
    { field: "techniqueIds", label: "เทคนิคที่เกี่ยวข้อง", optionSource: "techniques", model: "stepTechnique", self: "stepId", other: "techniqueId" },
    { field: "patternIds", label: "ลวดลายที่เกิดจากขั้นตอนนี้", optionSource: "patterns", model: "patternStep", self: "stepId", other: "patternId" },
    { field: "masterIds", label: "ช่างที่สอนขั้นตอนนี้", optionSource: "masters", model: "masterStep", self: "stepId", other: "masterId" },
  ],
};

export function relationsFor(resource: ResourceKey): RelationSpec[] {
  return relationsByResource[resource] ?? [];
}
