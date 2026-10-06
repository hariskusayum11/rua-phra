/**
 * Writes the environment file to hand to Vercel.
 *
 * The local `.env` cannot be used as it stands: its database points at a container on this
 * machine, its site address is localhost, and its admin password is one that has been typed
 * into a terminal on a laptop all week. Pasting it into a hosting provider would put a
 * development password in front of the public internet.
 *
 * So this builds the production set instead — carrying across only what genuinely travels
 * (the object store, the server database), rewriting what must change, and generating fresh
 * secrets. The result goes to a file rather than to the screen, so the values are copied
 * from the author's own disk and never through a chat window or a shell history.
 *
 *   npx tsx scripts/make-vercel-env.mjs rua-phra
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { objectStore } from "../src/lib/media-storage.ts";

const projectName = process.argv[2]?.trim();
if (!projectName) {
  console.error("ใช้: npx tsx scripts/make-vercel-env.mjs <ชื่อโปรเจกต์ใน Vercel>");
  console.error("ตัวอย่าง: npx tsx scripts/make-vercel-env.mjs rua-phra");
  process.exit(1);
}

const siteUrl = `https://${projectName}.vercel.app`;
const pooled = process.env.NEON_DATABASE_URL?.trim();
const store = objectStore();
const problems = [];

if (!pooled) problems.push("ไม่พบ NEON_DATABASE_URL ใน .env");
else if (!pooled.includes("-pooler")) problems.push("NEON_DATABASE_URL ไม่ใช่เส้นที่มี -pooler — เว็บบนเซิร์ฟเวอร์ต้องใช้เส้นที่มี pooler");
if (!store) problems.push("ตั้งค่า R2 ใน .env ไม่ครบทั้ง 5 ค่า");

if (problems.length > 0) {
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

/** A password that is strong and still possible to read aloud over a phone. */
function password() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(randomBytes(20), (byte) => alphabet[byte % alphabet.length]).join("");
}

const adminEmail = process.env.ADMIN_EMAIL?.trim() || "admin@ruaphra.local";
const adminPassword = password();
const authSecret = randomBytes(48).toString("base64");

const lines = [
  "# ค่าสำหรับ Vercel เท่านั้น — สร้างโดย scripts/make-vercel-env.mjs",
  "# ไฟล์นี้ไม่ขึ้น git แต่มีรหัสผ่านอยู่ข้างใน อย่าส่งต่อทางแชตและอย่าแคปหน้าจอ",
  "",
  `DATABASE_URL=${pooled}`,
  `NEXT_PUBLIC_SITE_URL=${siteUrl}`,
  `AUTH_URL=${siteUrl}`,
  `AUTH_SECRET=${authSecret}`,
  `ADMIN_EMAIL=${adminEmail}`,
  `ADMIN_PASSWORD=${adminPassword}`,
  `R2_ACCOUNT_ID=${store.accountId}`,
  `R2_ACCESS_KEY_ID=${store.accessKeyId}`,
  `R2_SECRET_ACCESS_KEY=${store.secretAccessKey}`,
  `R2_BUCKET=${store.bucket}`,
  `NEXT_PUBLIC_MEDIA_BASE_URL=${store.publicBase}`,
  "",
];

const out = path.join(process.cwd(), ".env.vercel");
await writeFile(out, lines.join("\n"), "utf8");

console.log(`เขียนไฟล์แล้ว: ${out}`);
console.log("");
console.log(`ที่อยู่เว็บไซต์   ${siteUrl}`);
console.log(`อีเมลผู้ดูแล     ${adminEmail}`);
console.log(`รหัสผ่านผู้ดูแล   อยู่ในไฟล์ บรรทัด ADMIN_PASSWORD — เปิดดูแล้วจดเก็บไว้`);
console.log("");
console.log("ขั้นต่อไป");
console.log("  1. ที่หน้า Vercel กดปุ่ม Import .env แล้วเลือกไฟล์นี้");
console.log(`  2. กลับไป Cloudflare R2 → CORS Policy เพิ่ม ${siteUrl} เข้าไปในรายการ`);
console.log("  3. กด Create Project");
