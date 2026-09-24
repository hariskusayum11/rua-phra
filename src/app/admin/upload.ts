"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { uploadRoot, uploadUrl } from "@/lib/media-storage";
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
    await mkdir(uploadRoot, { recursive: true });
    await writeFile(
      path.join(uploadRoot, fileName),
      await input.resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
    );

    return { ok: true, url: uploadUrl(fileName), storageKey, mimeType: "image/webp", width, height };
  } catch (error) {
    console.error("Media upload failed", error);
    return { ok: false, message: "อัปโหลดไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
}
