/**
 * Moves media out of the repository and off the local disk, into object storage.
 *
 * Two things move, for two different reasons:
 *
 *   1. Everything in `storage/uploads/` — photographs an editor uploaded. These live
 *      beside the server, and the server is about to move somewhere with no disk.
 *
 *   2. The videos in `public/videos/` — 39MB that currently travel inside every build and
 *      every clone, and that are the only thing on the site large enough to matter to a
 *      bandwidth allowance.
 *
 * Database rows are rewritten to point at the new addresses. Nothing is deleted: the
 * originals stay where they are until someone has looked at the site and agreed it works.
 *
 *   npx tsx scripts/migrate-media-to-r2.mjs --dry-run
 *   npx tsx scripts/migrate-media-to-r2.mjs
 */
import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { objectStore } from "../src/lib/media-storage.ts";

const dryRun = process.argv.includes("--dry-run");

// Read through the application's own loader rather than straight from the environment,
// so the script and the site agree on what the settings mean — including tolerating an
// account id pasted as the whole S3 address, which is what Cloudflare puts on screen.
const config = objectStore();
if (!config) {
  console.error("ยังไม่ได้ตั้งค่า R2 ใน .env — ต้องมีครบทั้ง 5 ค่า");
  console.error("  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, NEXT_PUBLIC_MEDIA_BASE_URL");
  process.exit(1);
}
const { bucket, publicBase } = config;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
});

const TYPES = {
  ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".png": "image/png", ".mp4": "video/mp4",
};

async function put(key, filePath) {
  let body;
  try {
    body = await readFile(filePath);
  } catch (error) {
    throw new Error(`อ่านไฟล์ต้นทางไม่ได้ (${error.code ?? error.message})`);
  }
  const contentType = TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
  if (!dryRun) {
    await s3.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: body, ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }));
  }
  return { url: `${publicBase}/${key}`, bytes: body.length };
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
let moved = 0;
let bytes = 0;

// ---------------------------------------------------------------- uploads
console.log("=== ภาพที่อัปโหลดผ่านแอดมิน ===");
let uploadFiles = [];
try {
  uploadFiles = await readdir(path.join(process.cwd(), "storage", "uploads"));
} catch {
  console.log("  ไม่มีโฟลเดอร์ storage/uploads — ข้าม");
}

// Files with no row pointing at them are leftovers from browser tests, which create real
// uploads and then delete the records. Counted rather than listed: a wall of skip lines
// buries the files that did move.
let orphans = 0;

for (const name of uploadFiles) {
  const row = await prisma.media.findFirst({ where: { url: `/media/${name}` }, select: { id: true, alt: true } });
  if (!row) {
    orphans += 1;
    continue;
  }
  const { url, bytes: size } = await put(name, path.join(process.cwd(), "storage", "uploads", name));
  if (!dryRun) await prisma.media.update({ where: { id: row.id }, data: { url } });
  console.log(`  ${name}  →  ${url}`);
  moved += 1;
  bytes += size;
}

if (orphans > 0) {
  console.log(`  ข้าม ${orphans} ไฟล์ที่ไม่มีระเบียนชี้มาถึง เป็นของเหลือจากการทดสอบ ลบทิ้งได้`);
}

// ----------------------------------------------------------------- videos
console.log("=== วิดีโอ ===");
const videos = await prisma.media.findMany({
  where: { kind: "VIDEO", url: { startsWith: "/videos/" } },
  select: { id: true, url: true, alt: true },
});

for (const video of videos) {
  const relative = video.url.replace(/^\//, "");
  const key = path.basename(relative);
  let result;
  try {
    result = await put(key, path.join(process.cwd(), "public", relative));
  } catch (error) {
    console.log(`  ข้าม ${video.url} — ${error.message}`);
    continue;
  }
  if (!dryRun) await prisma.media.update({ where: { id: video.id }, data: { url: result.url } });
  console.log(`  ${video.url}  →  ${result.url}  (${(result.bytes / 1048576).toFixed(1)} MB)`);
  moved += 1;
  bytes += result.bytes;
}

// Poster frames sit beside the videos and are referenced by their own Media rows.
const posters = await prisma.media.findMany({
  where: { kind: "IMAGE", url: { startsWith: "/videos/" } },
  select: { id: true, url: true },
});
for (const poster of posters) {
  const relative = poster.url.replace(/^\//, "");
  const key = path.basename(relative);
  let result;
  try {
    result = await put(key, path.join(process.cwd(), "public", relative));
  } catch (error) {
    console.log(`  ข้าม ${poster.url} — ${error.message}`);
    continue;
  }
  if (!dryRun) await prisma.media.update({ where: { id: poster.id }, data: { url: result.url } });
  console.log(`  ${poster.url}  →  ${result.url}`);
  moved += 1;
  bytes += result.bytes;
}

console.log(
  `\n${dryRun ? "ทดลองรัน ไม่ได้เขียนอะไร" : "ย้ายแล้ว"} ${moved} ไฟล์ รวม ${(bytes / 1048576).toFixed(1)} MB`,
);
if (!dryRun && moved > 0) {
  console.log("ไฟล์ต้นฉบับยังอยู่ที่เดิม ตรวจสอบว่าเว็บแสดงผลถูกต้องก่อนแล้วค่อยลบ");
}

await prisma.$disconnect();
