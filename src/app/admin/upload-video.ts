"use server";

import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { objectStore } from "@/lib/media-storage";
import { bucketUsage, headObject, presignUpload } from "@/lib/object-store";

/**
 * Taking a video from the editor's machine to the bucket, in two steps with the file never
 * touching this application.
 *
 * A procession clip is tens of megabytes; a server action tops out at a few. So the server
 * only signs a URL and then, afterwards, checks that something of the right size actually
 * arrived. The file itself goes browser → bucket.
 *
 * That split is also why `confirm` exists: the application did not witness the transfer and
 * cannot assume it finished. A cancelled upload must not leave a record pointing at nothing.
 */

const ACCEPTED = new Set(["video/mp4", "video/quicktime", "video/webm"]);
/** Longer than any clip the archive has needed, short of anything that fills the bucket. */
const MAX_BYTES = 300 * 1024 * 1024;

export type VideoTarget =
  | { ok: true; uploadUrl: string; storageKey: string; publicUrl: string }
  | { ok: false; message: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHORIZED");
  const user = await getDb().user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
}

export async function createVideoUploadTarget(input: { contentType: string; size: number }): Promise<VideoTarget> {
  try {
    await requireAdmin();

    if (!objectStore()) {
      return {
        ok: false,
        message: "ยังไม่ได้ตั้งค่าที่เก็บไฟล์ภายนอก การอัปโหลดวิดีโอต้องใช้ที่เก็บไฟล์ — ดูหน้าพื้นที่เก็บไฟล์",
      };
    }
    if (!ACCEPTED.has(input.contentType)) {
      return { ok: false, message: `ยังไม่รองรับไฟล์ชนิด ${input.contentType || "นี้"} — ใช้ MP4, MOV หรือ WebM` };
    }
    if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_BYTES) {
      return { ok: false, message: `ไฟล์ต้องมีขนาดไม่เกิน ${MAX_BYTES / 1024 ** 2} MB` };
    }

    // Checked before signing, so the refusal arrives before the editor waits out a long
    // upload only to be told there was never room for it.
    const usage = await bucketUsage();
    if (!usage) return { ok: false, message: "ตรวจสอบพื้นที่เก็บไฟล์ไม่ได้ในขณะนี้ ลองใหม่อีกครั้ง" };
    if (usage.bytes + input.size > usage.limitBytes) {
      const used = (usage.bytes / 1024 ** 3).toFixed(2);
      const limit = (usage.limitBytes / 1024 ** 3).toFixed(0);
      return {
        ok: false,
        message: `พื้นที่เก็บไฟล์เหลือไม่พอสำหรับไฟล์นี้ (ใช้ไป ${used} GB จาก ${limit} GB) ลบไฟล์ที่ไม่ใช้ออกก่อน`,
      };
    }

    const extension = input.contentType === "video/webm" ? "webm" : input.contentType === "video/quicktime" ? "mov" : "mp4";
    const storageKey = `video-${randomUUID()}`;
    const signed = await presignUpload(`${storageKey}.${extension}`, input.contentType);
    if (!signed) return { ok: false, message: "สร้างลิงก์อัปโหลดไม่สำเร็จ" };

    return { ok: true, uploadUrl: signed.url, storageKey, publicUrl: signed.publicUrl };
  } catch (error) {
    console.error("Video upload target failed", error);
    return { ok: false, message: "เตรียมการอัปโหลดไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
}

export type VideoConfirmation =
  | { ok: true; url: string; bytes: number; mimeType: string; posterMediaId: string | null }
  | { ok: false; message: string };

/**
 * Confirms the file is in the bucket at roughly the size the browser said it sent, and
 * records the poster frame as a record of its own.
 *
 * The poster is created here rather than in the form because a video row references it by
 * id: the still has to exist before the video that points at it can be saved.
 */
export async function confirmVideoUpload(input: {
  fileName: string;
  expectedBytes: number;
  poster?: { url: string; storageKey: string; width: number; height: number; alt: string };
}): Promise<VideoConfirmation> {
  try {
    await requireAdmin();
    const found = await headObject(input.fileName);
    if (!found) return { ok: false, message: "อัปโหลดไม่สำเร็จ ไม่พบไฟล์ที่ปลายทาง กรุณาลองใหม่" };
    // A short upload means a cancelled or truncated transfer, which would play as a
    // broken video rather than as an error.
    if (found.bytes < input.expectedBytes * 0.98) {
      return { ok: false, message: "ไฟล์ที่ปลายทางไม่ครบ อาจถูกยกเลิกกลางคัน กรุณาอัปโหลดใหม่" };
    }
    let posterMediaId: string | null = null;
    if (input.poster) {
      const poster = await getDb().media.create({
        data: {
          kind: "IMAGE",
          provider: "LOCAL",
          url: input.poster.url,
          storageKey: input.poster.storageKey,
          alt: input.poster.alt,
          mimeType: "image/webp",
          width: input.poster.width,
          height: input.poster.height,
        },
        select: { id: true },
      });
      posterMediaId = poster.id;
    }

    const store = objectStore();
    return {
      ok: true,
      url: `${store!.publicBase}/${input.fileName}`,
      bytes: found.bytes,
      mimeType: found.contentType,
      posterMediaId,
    };
  } catch (error) {
    console.error("Video upload confirmation failed", error);
    return { ok: false, message: "ยืนยันการอัปโหลดไม่สำเร็จ" };
  }
}
