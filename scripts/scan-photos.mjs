/**
 * Lists whatever is waiting in photos/incoming, with the dimensions and aspect ratio of
 * each file, and suggests which slot on the site it fits.
 *
 * This runs before anything is imported. It exists so a photograph's real shape is known
 * before it is promised to a frame — a 3:2 landscape shot cannot become a 4:5 portrait
 * without losing a third of the picture, and it is better to find that out here.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const incoming = path.join(root, "photos", "incoming");

/** The frames the site reserves, as ratio value → where it is used. */
const SLOTS = [
  { name: "boat", ratio: 16 / 9, label: "เรือพระเต็มลำ / จุดบนเรือ / ภาพปิดท้าย", usage: "16:9" },
  { name: "process", ratio: 3 / 2, label: "ขั้นตอนการทำงาน", usage: "3:2" },
  { name: "pattern", ratio: 1, label: "ลวดลาย", usage: "1:1" },
  { name: "portrait", ratio: 4 / 5, label: "ช่าง / งานกระดาษระยะใกล้ / ผลงานผู้เรียน", usage: "4:5" },
];

const IMAGE = /\.(jpe?g|png|webp|avif|tiff?)$/i;

function nearestSlot(ratio) {
  let best = SLOTS[0];
  let bestDistance = Infinity;
  for (const slot of SLOTS) {
    // Compare in log space so 2:1 is as far from 1:1 as 1:2 is.
    const distance = Math.abs(Math.log(ratio / slot.ratio));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = slot;
    }
  }
  return { slot: best, loss: 1 - Math.min(ratio, best.ratio) / Math.max(ratio, best.ratio) };
}

function formatBytes(bytes) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;
}

let entries;
try {
  entries = await readdir(incoming);
} catch {
  console.log("ยังไม่มีโฟลเดอร์ photos/incoming — สร้างแล้ววางไฟล์ภาพได้เลย");
  process.exit(0);
}

const files = entries.filter((name) => IMAGE.test(name)).sort();
const skipped = entries.filter((name) => !IMAGE.test(name) && name !== "NOTES.txt" && !name.startsWith("."));

if (files.length === 0) {
  console.log("ยังไม่มีไฟล์ภาพใน photos/incoming\n");
  console.log("วางไฟล์ต้นฉบับ (.jpg .png .webp) ไว้ในโฟลเดอร์นั้น แล้วรันคำสั่งนี้อีกครั้ง");
  if (skipped.length > 0) console.log(`\nไฟล์ที่ไม่ใช่ภาพและถูกข้าม: ${skipped.join(", ")}`);
  process.exit(0);
}

console.log(`พบภาพ ${files.length} ไฟล์ใน photos/incoming\n`);
console.log("ไฟล์".padEnd(34), "ขนาด".padEnd(13), "สัดส่วน".padEnd(9), "ขนาดไฟล์".padEnd(9), "น่าจะใช้กับ");
console.log("-".repeat(110));

const warnings = [];
for (const name of files) {
  const filePath = path.join(incoming, name);
  const { size } = await stat(filePath);
  let meta;
  try {
    meta = await sharp(filePath).metadata();
  } catch (error) {
    warnings.push(`${name} — อ่านไฟล์ไม่ได้ (${error.message.split("\n")[0]})`);
    continue;
  }
  // EXIF orientation 5–8 swap the stored width and height.
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;
  const ratio = width / height;
  const { slot, loss } = nearestSlot(ratio);

  console.log(
    name.slice(0, 33).padEnd(34),
    `${width}×${height}`.padEnd(13),
    ratio.toFixed(2).padEnd(9),
    formatBytes(size).padEnd(9),
    `${slot.usage} ${slot.label}`,
  );

  if (width < 1600 && slot.usage === "16:9") {
    warnings.push(`${name} — กว้างเพียง ${width}px ภาพเต็มลำควรกว้างอย่างน้อย 1600px`);
  }
  if (width < 1200 && slot.usage !== "16:9") {
    warnings.push(`${name} — กว้างเพียง ${width}px เล็กกว่าที่กรอบต้องการ`);
  }
  if (loss > 0.2) {
    warnings.push(`${name} — สัดส่วน ${ratio.toFixed(2)} ต่างจากกรอบ ${slot.usage} มาก จะถูกตัดออกราว ${Math.round(loss * 100)}%`);
  }
}

const notesPath = path.join(incoming, "NOTES.txt");
let notes = "";
try {
  notes = await readFile(notesPath, "utf8");
} catch {
  /* absent is fine */
}
const written = notes.split("\n").filter((line) => line.trim() && !line.trimStart().startsWith("#"));

console.log();
if (written.length === 0) {
  console.log("⚠ ยังไม่ได้เขียน NOTES.txt — ต้องรู้ว่าภาพไหนคือเรือลำใด ช่างคนใด และขออนุญาตแล้วหรือยัง");
} else {
  console.log(`✓ NOTES.txt มีข้อมูล ${written.length} บรรทัด`);
}

if (warnings.length > 0) {
  console.log("\nข้อสังเกต:");
  for (const warning of warnings) console.log(`  · ${warning}`);
}
if (skipped.length > 0) console.log(`\nไฟล์ที่ไม่ใช่ภาพและถูกข้าม: ${skipped.join(", ")}`);
