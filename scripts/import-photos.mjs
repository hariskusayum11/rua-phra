/**
 * Brings real field photography into the archive.
 *
 * Reads photos/manifest.json, processes each original from photos/incoming with sharp,
 * writes a web-sized WebP into public/photos, records it as a Media row with its alt text,
 * provenance and focal point, and attaches it to the boat, section, pattern, master, step
 * or learner work it belongs to.
 *
 * Two things it deliberately refuses to do:
 *   · It never publishes a recognisable person whose consent is still pending. The image is
 *     stored so no work is lost, but it is not attached to anything the public page reads.
 *   · It never carries EXIF through. Field photographs routinely embed GPS coordinates of
 *     a named person's home; sharp drops all metadata unless asked to keep it.
 *
 * Usage:
 *   node scripts/import-photos.mjs --dry-run    inspect the plan, touch nothing
 *   node scripts/import-photos.mjs              process, copy and write to the database
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import "dotenv/config";
import sharp from "sharp";
import { PrismaPg } from "@prisma/adapter-pg";
import ffmpegPath from "ffmpeg-static";
// Enums come straight from their own module: the client's `export *` re-export is not
// statically visible to an ES module importing it through tsx.
import { MediaKind, MediaProvider } from "../src/generated/prisma/enums.ts";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const run = promisify(execFile);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const incoming = path.join(root, "photos", "incoming");
const published = path.join(root, "public", "photos");
/**
 * Material held for consent is processed but kept out of public/ entirely. Writing it to a
 * public folder and merely not linking it is not withholding — the URL is guessable and
 * the file is served to anyone who asks.
 */
const withheldRoot = path.join(root, "photos", "withheld");
const manifestPath = path.join(root, "photos", "manifest.json");
const dryRun = process.argv.includes("--dry-run");
/** Re-encoding a two-minute clip to change a photograph's focal point helps nobody. */
const imagesOnly = process.argv.includes("--images-only");

/**
 * Each slot declares the frame it fills, how wide the stored file needs to be for that
 * frame at a 2x display, and whether the picture can show an identifiable person.
 */
const SLOTS = {
  "boat-cover": { folder: "boats", ratio: 16 / 9, width: 2400, identifiable: false },
  "boat-section": { folder: "sections", ratio: 16 / 9, width: 1800, identifiable: false },
  pattern: { folder: "patterns", ratio: 1, width: 1600, identifiable: false },
  "master-portrait": { folder: "masters", ratio: 4 / 5, width: 1600, identifiable: true },
  "process-step": { folder: "process", ratio: 3 / 2, width: 1800, identifiable: true },
  "process-closeup": { folder: "process", ratio: 4 / 5, width: 1600, identifiable: true },
  "student-work": { folder: "works", ratio: 4 / 5, width: 1600, identifiable: false },
  closing: { folder: "boats", ratio: 16 / 9, width: 2400, identifiable: false },
  library: { folder: "library", ratio: null, width: 2000, identifiable: true },
};

/**
 * Video is transcoded rather than copied. Field footage arrives as phone captures and
 * screen recordings measured in tens of megabytes; nothing that size belongs on a page
 * someone opens over mobile data.
 */
const VIDEO_SLOTS = {
  "boat-procession": { folder: "procession", width: 1280, identifiable: true },
  "video-library": { folder: "library", width: 1280, identifiable: true },
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to import photography.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const problems = [];
const done = [];
const held = [];

function fail(message) {
  problems.push(message);
}

let manifest;
try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch (error) {
  console.error(`อ่าน photos/manifest.json ไม่ได้: ${error.message}`);
  console.error("รัน `npm run photos:scan` ก่อน แล้วบอกให้ Claude สร้าง manifest ให้จากภาพที่วางไว้");
  process.exit(1);
}

const defaults = {
  photographer: manifest.photographer ?? null,
  takenAt: manifest.takenAt ? new Date(manifest.takenAt) : null,
  location: manifest.location ?? null,
  credit: manifest.credit ?? null,
};

for (const entry of manifest.images ?? []) {
  const slot = SLOTS[entry.slot];
  if (!slot) {
    fail(`${entry.file}: ไม่รู้จัก slot "${entry.slot}"`);
    continue;
  }
  if (!entry.alt || entry.alt.trim().length < 10) {
    fail(`${entry.file}: ต้องมีคำบรรยายภาพ (alt) ที่อธิบายภาพได้จริง`);
    continue;
  }
  if (!entry.key) {
    fail(`${entry.file}: ต้องมี key สำหรับอ้างอิงภาพนี้`);
    continue;
  }

  const source = path.join(incoming, entry.file);
  let image;
  let meta;
  try {
    image = sharp(source).rotate(); // applies EXIF orientation, then metadata is dropped
    meta = await image.metadata();
  } catch (error) {
    fail(`${entry.file}: เปิดไฟล์ไม่ได้ (${error.message.split("\n")[0]})`);
    continue;
  }

  const rotated = (meta.orientation ?? 1) >= 5;
  let sourceWidth = rotated ? meta.height : meta.width;
  let sourceHeight = rotated ? meta.width : meta.height;

  /**
   * An editorial crop, in source pixels. Two honest uses: lifting a bystander out of a
   * frame when consent was never asked for, and trimming a camera's baked-in watermark
   * bar. Anything beyond that belongs to whoever took the photograph.
   */
  if (entry.crop) {
    const { left = 0, top = 0 } = entry.crop;
    const width = entry.crop.width ?? sourceWidth - left;
    const height = entry.crop.height ?? sourceHeight - top;
    if (left + width > sourceWidth || top + height > sourceHeight || width <= 0 || height <= 0) {
      fail(`${entry.file}: กรอบ crop เกินขอบภาพ (${sourceWidth}×${sourceHeight})`);
      continue;
    }
    image = image.extract({ left, top, width, height });
    sourceWidth = width;
    sourceHeight = height;
  }

  // The stored file keeps the photograph's own shape. The page crops it to the frame at
  // render time around the focal point, so nothing is thrown away here.
  const targetWidth = Math.min(slot.width, sourceWidth);
  const targetHeight = Math.round((targetWidth / sourceWidth) * sourceHeight);
  const consent = entry.consent ?? "pending";
  const withholding = slot.identifiable && consent !== "granted" && consent !== "not-required";

  const relative = `photos/${slot.folder}/${entry.key}.webp`;
  const destination = withholding
    ? path.join(withheldRoot, slot.folder, `${entry.key}.webp`)
    : path.join(published, slot.folder, `${entry.key}.webp`);

  if (!dryRun) {
    await mkdir(path.dirname(destination), { recursive: true });
    await image.resize({ width: targetWidth, withoutEnlargement: true }).webp({ quality: 82 }).toFile(destination);
  }

  const mediaData = {
    kind: MediaKind.IMAGE,
    provider: MediaProvider.LOCAL,
    storageKey: entry.key,
    // A withheld file has no public address, and the record says so rather than pointing
    // at something that would 404 — or worse, at something that would resolve.
    url: withholding ? null : `/${relative}`,
    alt: entry.alt.trim(),
    mimeType: "image/webp",
    width: targetWidth,
    height: targetHeight,
    credit: entry.credit ?? defaults.credit,
    photographer: entry.photographer ?? defaults.photographer,
    takenAt: entry.takenAt ? new Date(entry.takenAt) : defaults.takenAt,
    location: entry.location ?? defaults.location,
    focalX: entry.focalX ?? null,
    focalY: entry.focalY ?? null,
    isDemo: false,
  };

  if (dryRun) {
    done.push(`${entry.file} → ${relative} (${targetWidth}×${targetHeight})${withholding ? " — ยังไม่แนบ รอการขออนุญาต" : ""}`);
    continue;
  }

  const media = await prisma.media.upsert({
    where: { provider_storageKey: { provider: MediaProvider.LOCAL, storageKey: entry.key } },
    update: mediaData,
    create: mediaData,
  });

  if (withholding) {
    held.push(`${entry.file} → บันทึกไว้แล้วแต่ยังไม่นำขึ้นหน้าเว็บ เพราะสถานะการขออนุญาตคือ "${consent}"`);
    continue;
  }

  try {
    await attach(entry, media.id, slot);
    done.push(`${entry.file} → ${relative} (${targetWidth}×${targetHeight}) · ${entry.slot} · ${entry.target ?? "คลังภาพ"}`);
  } catch (error) {
    fail(`${entry.file}: แนบกับ ${entry.target} ไม่ได้ — ${error.message}`);
  }
}

for (const entry of imagesOnly ? [] : manifest.videos ?? []) {
  const slot = VIDEO_SLOTS[entry.slot];
  if (!slot) {
    fail(`${entry.file}: ไม่รู้จัก slot วิดีโอ "${entry.slot}"`);
    continue;
  }
  if (!entry.alt || !entry.key) {
    fail(`${entry.file}: วิดีโอต้องมี key และคำบรรยาย`);
    continue;
  }

  const source = path.join(incoming, entry.file);
  const consent = entry.consent ?? "pending";
  const withholding = slot.identifiable && consent !== "granted" && consent !== "not-required";

  const relative = `videos/${slot.folder}/${entry.key}.mp4`;
  const posterRelative = `videos/${slot.folder}/${entry.key}-poster.jpg`;
  const outputRoot = withholding ? withheldRoot : path.join(root, "public");
  const destination = path.join(outputRoot, relative);
  const posterDestination = path.join(outputRoot, posterRelative);

  let probe;
  try {
    const { stdout } = await run(ffmpegPath.replace("ffmpeg.exe", "ffprobe.exe"), [
      "-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=width,height:format=duration",
      "-of", "json", source,
    ]).catch(async () => {
      // ffmpeg-static ships no ffprobe; read the same numbers from ffmpeg's own report.
      const { stderr } = await run(ffmpegPath, ["-i", source, "-f", "null", "-"]).catch((error) => error);
      const dims = /, (\d{2,5})x(\d{2,5})[ ,]/.exec(stderr ?? "");
      const time = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(stderr ?? "");
      return {
        stdout: JSON.stringify({
          streams: [{ width: Number(dims?.[1] ?? 0), height: Number(dims?.[2] ?? 0) }],
          format: { duration: time ? Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3]) : 0 },
        }),
      };
    });
    probe = JSON.parse(stdout);
  } catch (error) {
    fail(`${entry.file}: อ่านข้อมูลวิดีโอไม่ได้ (${String(error).split("\n")[0]})`);
    continue;
  }

  const sourceWidth = probe.streams?.[0]?.width ?? 0;
  const sourceHeight = probe.streams?.[0]?.height ?? 0;
  const duration = Number(probe.format?.duration ?? 0);
  const targetWidth = Math.min(slot.width, sourceWidth || slot.width);
  const targetHeight = sourceWidth ? Math.round((targetWidth / sourceWidth) * sourceHeight / 2) * 2 : 0;

  if (dryRun) {
    done.push(`${entry.file} → ${relative} (${targetWidth}×${targetHeight}, ${Math.round(duration)}s)${withholding ? " — ยังไม่แนบ รอการขออนุญาต" : ""}`);
    continue;
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await mkdir(path.dirname(posterDestination), { recursive: true });
  try {
    await run(ffmpegPath, [
      "-y", "-i", source,
      "-vf", `scale=${targetWidth}:-2`,
      "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "96k", "-ac", "2",
      "-movflags", "+faststart",
      destination,
    ], { maxBuffer: 64 * 1024 * 1024 });
    await run(ffmpegPath, [
      "-y", "-ss", String(entry.posterAt ?? Math.min(3, duration / 3)), "-i", source,
      "-frames:v", "1", "-vf", `scale=${targetWidth}:-2`, "-q:v", "4",
      posterDestination,
    ], { maxBuffer: 16 * 1024 * 1024 });
  } catch (error) {
    fail(`${entry.file}: แปลงวิดีโอไม่สำเร็จ — ${String(error).split("\n")[0]}`);
    continue;
  }

  const posterData = {
    kind: MediaKind.IMAGE,
    provider: MediaProvider.LOCAL,
    storageKey: `${entry.key}-poster`,
    url: withholding ? null : `/${posterRelative}`,
    alt: entry.posterAlt ?? entry.alt,
    mimeType: "image/jpeg",
    width: targetWidth,
    height: targetHeight,
    credit: entry.credit ?? defaults.credit,
    photographer: entry.photographer ?? defaults.photographer,
    takenAt: entry.takenAt ? new Date(entry.takenAt) : defaults.takenAt,
    location: entry.location ?? defaults.location,
    focalX: entry.focalX ?? null,
    focalY: entry.focalY ?? null,
    isDemo: false,
  };
  const poster = await prisma.media.upsert({
    where: { provider_storageKey: { provider: MediaProvider.LOCAL, storageKey: posterData.storageKey } },
    update: posterData,
    create: posterData,
  });

  const { size } = await stat(destination);
  const videoData = {
    kind: MediaKind.VIDEO,
    provider: MediaProvider.LOCAL,
    storageKey: entry.key,
    url: withholding ? null : `/${relative}`,
    alt: entry.alt.trim(),
    mimeType: "video/mp4",
    width: targetWidth,
    height: targetHeight,
    durationSeconds: duration,
    credit: entry.credit ?? defaults.credit,
    photographer: entry.photographer ?? defaults.photographer,
    takenAt: entry.takenAt ? new Date(entry.takenAt) : defaults.takenAt,
    location: entry.location ?? defaults.location,
    posterMediaId: poster.id,
    isDemo: false,
  };
  const video = await prisma.media.upsert({
    where: { provider_storageKey: { provider: MediaProvider.LOCAL, storageKey: entry.key } },
    update: videoData,
    create: videoData,
  });

  if (withholding) {
    held.push(`${entry.file} → แปลงและบันทึกแล้วแต่ยังไม่นำขึ้นหน้าเว็บ เพราะสถานะการขออนุญาตคือ "${consent}"`);
    continue;
  }

  try {
    if (entry.slot === "boat-procession") {
      await prisma.boat.update({ where: { slug: entry.target }, data: { processionMediaId: video.id } });
    }
    done.push(`${entry.file} → ${relative} (${targetWidth}×${targetHeight}, ${Math.round(duration)}s, ${(size / 1024 / 1024).toFixed(1)}MB) · ${entry.target ?? "คลังวิดีโอ"}`);
  } catch (error) {
    fail(`${entry.file}: แนบวิดีโอกับ ${entry.target} ไม่ได้ — ${error.message}`);
  }
}

async function attach(entry, mediaId, slot) {
  const target = entry.target;
  switch (entry.slot) {
    case "boat-cover":
    case "closing": {
      if (entry.slot === "closing") return; // held in the library and chosen by the page
      await prisma.boat.update({ where: { slug: target }, data: { coverMediaId: mediaId } });
      return;
    }
    case "boat-section": {
      const [boatSlug, sectionSlug] = String(target).split("/");
      if (!boatSlug || !sectionSlug) throw new Error('target ต้องอยู่ในรูป "boat-slug/section-slug"');
      const boat = await prisma.boat.findUnique({ where: { slug: boatSlug }, select: { id: true } });
      if (!boat) throw new Error(`ไม่พบเรือ ${boatSlug}`);
      await prisma.boatSection.update({
        where: { boatId_slug: { boatId: boat.id, slug: sectionSlug } },
        data: { closeupMediaId: mediaId },
      });
      return;
    }
    case "pattern":
      await prisma.pattern.update({ where: { slug: target }, data: { imageMediaId: mediaId } });
      return;
    case "master-portrait":
      await prisma.master.update({ where: { slug: target }, data: { portraitMediaId: mediaId } });
      return;
    case "process-step":
      await prisma.processStep.update({ where: { slug: target }, data: { coverMediaId: mediaId } });
      return;
    case "process-closeup": {
      const step = await prisma.processStep.findUnique({ where: { slug: target }, select: { id: true } });
      if (!step) throw new Error(`ไม่พบขั้นตอน ${target}`);
      await prisma.stepMedia.upsert({
        where: { stepId_position: { stepId: step.id, position: 2 } },
        update: { mediaId, caption: entry.caption ?? null },
        create: { stepId: step.id, mediaId, role: "INSTRUCTION", position: 2, caption: entry.caption ?? null },
      });
      return;
    }
    case "student-work": {
      // Learner work stores its own url rather than a Media relation.
      const work = await prisma.studentWork.findUnique({ where: { slug: target }, select: { id: true } });
      if (!work) throw new Error(`ไม่พบผลงาน ${target}`);
      const existing = await prisma.studentWorkMedia.findFirst({ where: { workId: work.id, position: 1 } });
      const data = { stage: "FINAL", url: `/photos/${slot.folder}/${entry.key}.webp`, alt: entry.alt.trim(), position: 1 };
      if (existing) await prisma.studentWorkMedia.update({ where: { id: existing.id }, data });
      else await prisma.studentWorkMedia.create({ data: { workId: work.id, ...data } });
      return;
    }
    case "library":
      return;
    default:
      throw new Error(`ไม่รองรับ slot ${entry.slot}`);
  }
}

console.log(dryRun ? "ทดลองนำเข้า (ยังไม่เขียนอะไรจริง)\n" : "นำเข้าภาพเรียบร้อย\n");
for (const line of done) console.log(`  ✓ ${line}`);
if (held.length > 0) {
  console.log("\nรอการขออนุญาตก่อนเผยแพร่:");
  for (const line of held) console.log(`  · ${line}`);
}
if (problems.length > 0) {
  console.log("\nปัญหาที่ต้องแก้:");
  for (const line of problems) console.log(`  ✗ ${line}`);
}
if (!dryRun && done.length > 0) {
  await writeFile(
    path.join(root, "photos", "last-import.json"),
    JSON.stringify({ importedAt: new Date().toISOString(), entries: done, held, problems }, null, 2),
    "utf8",
  );
  console.log("\nรันต่อ: npm run build  แล้วตรวจหน้าเว็บอีกครั้ง");
}

await prisma.$disconnect();
process.exit(problems.length > 0 ? 1 : 0);
