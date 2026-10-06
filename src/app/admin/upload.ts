"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { objectStore, uploadRoot, uploadUrl } from "@/lib/media-storage";
import { bucketUsage, putObject } from "@/lib/object-store";
import sharp from "sharp";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

export type UploadResult =
  | { ok: true; url: string; storageKey: string; mimeType: string; width: number; height: number }
  | { ok: false; message: string };

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"]);
/** Wide enough for a full-bleed hero on a dense display, small enough to serve. */
const MAX_WIDTH = 2400;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHORIZED");
  const user = await getDb().user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
}

/**
 * Accepts one photograph from the admin form and returns where it landed.
 *
 * The file is re-encoded rather than copied. That is what strips the EXIF block: field
 * photographs routinely carry GPS coordinates, and those coordinates are often a named
 * person's home. sharp drops all metadata unless told to keep it, and nothing here tells
 * it to. Re-encoding also normalises orientation, so a phone photo does not arrive sideways.
 */
export async function uploadMediaFile(formData: FormData): Promise<UploadResult> {
  try {
    await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, message: "กรุณาเลือกไฟล์ภาพ" };
    if (file.size > MAX_BYTES) {
      return { ok: false, message: `ไฟล์ใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) ขนาดสูงสุดคือ 25MB` };
    }
    if (!ACCEPTED.has(file.type)) {
      return { ok: false, message: `ยังไม่รองรับไฟล์ชนิด ${file.type || "นี้"} — ใช้ JPG, PNG หรือ WebP` };
    }

    const input = sharp(Buffer.from(await file.arrayBuffer())).rotate();
    const meta = await input.metadata();
    if (!meta.width || !meta.height) return { ok: false, message: "อ่านขนาดภาพไม่ได้ ไฟล์อาจเสียหาย" };

    const rotated = (meta.orientation ?? 1) >= 5;
    const sourceWidth = rotated ? meta.height : meta.width;
    const sourceHeight = rotated ? meta.width : meta.height;
    const width = Math.min(MAX_WIDTH, sourceWidth);
    const height = Math.round((width / sourceWidth) * sourceHeight);

    const storageKey = `upload-${randomUUID()}`;
    const fileName = `${storageKey}.webp`;
    const body = await input.resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();

    // Refuse before writing, not after. The free allowance on the object store is
    // generous enough that this should never fire, but "should never" is not a thing to
    // put between a project with no budget and a bill it did not agree to.
    const usage = await bucketUsage();
    if (objectStore() && !usage) {
      return { ok: false, message: "ตรวจสอบพื้นที่เก็บไฟล์ไม่ได้ในขณะนี้ จึงยังไม่อัปโหลด — ลองใหม่อีกครั้ง หรือดูหน้าพื้นที่เก็บไฟล์" };
    }
    if (usage && usage.bytes + body.length > usage.limitBytes) {
      const used = (usage.bytes / 1024 ** 3).toFixed(2);
      const limit = (usage.limitBytes / 1024 ** 3).toFixed(0);
      return {
        ok: false,
        message:
          `พื้นที่เก็บไฟล์เต็มเพดานที่ตั้งไว้แล้ว (ใช้ไป ${used} GB จาก ${limit} GB) ` +
          "ระบบหยุดอัปโหลดไว้เพื่อไม่ให้เกินโควตาฟรีและถูกเรียกเก็บเงิน — ลบไฟล์ที่ไม่ใช้ออกก่อน หรือขยายเพดานที่ R2_MAX_BYTES",
      };
    }

    // The bucket when one is configured, the disk beside the server when not. Writing
    // first and recording the address afterwards means a failed upload leaves no record
    // pointing at a file that was never stored.
    const stored = await putObject(fileName, body, "image/webp");
    if (!stored) {
      await mkdir(uploadRoot, { recursive: true });
      await writeFile(path.join(uploadRoot, fileName), body);
    }

    return { ok: true, url: stored ?? uploadUrl(fileName), storageKey, mimeType: "image/webp", width, height };
  } catch (error) {
    console.error("Media upload failed", error);
    return { ok: false, message: "อัปโหลดไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
}
