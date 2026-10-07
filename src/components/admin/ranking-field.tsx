"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { readRanking, type RankingRow } from "@/lib/admin/ranking";
import type { AdminOption } from "@/lib/services/admin";

const RANK_LABEL: Record<number, string> = { 1: "ที่ 1", 2: "ที่ 2", 3: "ที่ 3", 4: "ที่ 4" };
const rankLabel = (rank: number) => RANK_LABEL[rank] ?? `ที่ ${rank}`;

/**
 * The placings of one competition year.
 *
 * Like the lesson editors, it writes into a hidden JSON field rather than numbered inputs,
 * because rows get inserted, deleted and reordered and `results[2].templeId` stops meaning
 * anything the moment row one is removed.
 *
 * The rank is the row's position and is shown, not typed. Moving วัดหัวควน above
 * วัดรัตนาราม is the whole of what "they swapped places" means here, and an editor doing
 * that should not also have to remember to renumber two boxes.
 */
export function RankingField({
  value, onChange, label, help, error, templeOptions,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  help?: string;
  error?: string;
  templeOptions: AdminOption[];
}) {
  const rows = useMemo(() => readRanking(value), [value]);
  const commit = (next: RankingRow[]) => onChange(JSON.stringify(next));

  function update(index: number, patch: Partial<RankingRow>) {
    commit(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  // A temple cannot take two places in the same year, so one already chosen is called out
  // rather than silently accepted and refused on save.
  const counts = new Map<string, number>();
  for (const row of rows) if (row.templeId) counts.set(row.templeId, (counts.get(row.templeId) ?? 0) + 1);

  return (
    <fieldset className="lesson-editor admin-field-wide">
      <legend>{label} · {rows.length} อันดับ</legend>
      {help && <p>{help}</p>}

      {rows.length === 0 ? (
        <p className="lesson-editor-empty">ยังไม่มีอันดับ — ปีที่ไม่ได้จัดงานเว้นว่างไว้แบบนี้</p>
      ) : (
        <ol className="lesson-editor-list">
          {rows.map((row, index) => (
            <li key={index} className="lesson-editor-block">
              <header>
                <strong>{rankLabel(index + 1)}</strong>
                <div>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`ย้าย${rankLabel(index + 1)}ขึ้น`}><ArrowUp aria-hidden="true" /></button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} aria-label={`ย้าย${rankLabel(index + 1)}ลง`}><ArrowDown aria-hidden="true" /></button>
                  <button type="button" onClick={() => commit(rows.filter((_, i) => i !== index))} aria-label={`ลบ${rankLabel(index + 1)}`}><Trash2 aria-hidden="true" /></button>
                </div>
              </header>

              <label className="admin-field">
                <span>วัด</span>
                <select value={row.templeId} onChange={(event) => update(index, { templeId: event.target.value })}>
                  <option value="">— เลือกวัด —</option>
                  {templeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {row.templeId && (counts.get(row.templeId) ?? 0) > 1 && (
                  <small className="field-error">วัดนี้ถูกเลือกไว้มากกว่าหนึ่งอันดับในปีเดียวกัน</small>
                )}
              </label>

              <label className="admin-field">
                <span>หมายเหตุ</span>
                <input type="text" value={row.note ?? ""} onChange={(event) => update(index, { note: event.target.value })} />
                <small>ใช้บันทึกสิ่งที่ต่างจากต้นทาง เช่น ตัวสะกดชื่อวัดที่เขียนมาคนละแบบ</small>
              </label>
            </li>
          ))}
        </ol>
      )}

      <div className="lesson-editor-add">
        <button type="button" onClick={() => commit([...rows, { templeId: "", note: "" }])}>
          <Plus aria-hidden="true" />เพิ่ม{rankLabel(rows.length + 1)}
        </button>
      </div>

      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}
