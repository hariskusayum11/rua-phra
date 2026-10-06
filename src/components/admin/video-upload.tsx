"use client";

import { useRef, useState } from "react";
import { Film, Upload } from "lucide-react";
import { confirmVideoUpload, createVideoUploadTarget } from "@/app/admin/upload-video";
import { uploadMediaFile } from "@/app/admin/upload";

export type VideoUploadResult = {
  url: string;
  storageKey: string;
  mimeType: string;
  width: number;
  height: number;
  durationSeconds: number;
  posterMediaId: string | null;
};

/**
 * Reads the dimensions, the length, and one still frame out of a video, in the browser.
 *
 * The frame matters: a video with no poster shows a black rectangle until someone presses
 * play, and on this site the procession clip never autoplays. Taking it here means the
 * server never has to decode video, which it could not do on a serverless host anyway.
 *
 * Three seconds in, or a third of the way through a shorter clip — far enough past the
 * start to miss the lens cap and the first shaky second.
 */
async function probe(file: File): Promise<{ width: number; height: number; duration: number; poster: Blob | null }> {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  const objectUrl = URL.createObjectURL(file);

  try {
    video.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("เปิดไฟล์วิดีโอนี้ไม่ได้ — เบราว์เซอร์อ่านไฟล์ไม่ออก ลองแปลงเป็น MP4 แล้วอัปโหลดใหม่"));
    });

    const width = video.videoWidth;
    const height = video.videoHeight;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;

    let poster: Blob | null = null;
    try {
      video.currentTime = Math.min(3, duration / 3);
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("seek"));
        setTimeout(() => reject(new Error("seek")), 10_000);
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(1600, width);
      canvas.height = Math.round((canvas.width / width) * height);
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      poster = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    } catch {
      // A codec the browser can play but not seek frame-accurately. The record is still
      // worth having; the poster can be set by hand afterwards.
    }

    return { width, height, duration, poster };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** PUT with progress. fetch cannot report upload progress, and a 30MB wait needs a bar. */
function putWithProgress(url: string, file: File, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onload = () => (request.status >= 200 && request.status < 300
      ? resolve()
      : reject(new Error(`อัปโหลดไม่สำเร็จ (${request.status})`)));
    request.onerror = () => reject(new Error("เครือข่ายขัดข้องระหว่างอัปโหลด"));
    request.onabort = () => reject(new Error("ยกเลิกการอัปโหลด"));
    request.send(file);
  });
}

export function VideoUploadField({ onComplete }: { onComplete: (result: VideoUploadResult) => void }) {
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function choose(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    setProgress(0);

    try {
      setStage("กำลังอ่านข้อมูลวิดีโอ");
      const { width, height, duration, poster } = await probe(file);

      setStage("กำลังเตรียมที่เก็บไฟล์");
      const target = await createVideoUploadTarget({ contentType: file.type, size: file.size });
      if (!target.ok) {
        setError(target.message);
        return;
      }

      setStage("กำลังอัปโหลดวิดีโอ");
      await putWithProgress(target.uploadUrl, file, setProgress);

      // The poster is small enough to go through the ordinary image path, which also
      // re-encodes it and strips anything the frame grab carried along.
      let posterInput;
      if (poster) {
        setStage("กำลังอัปโหลดภาพปก");
        const body = new FormData();
        body.append("file", new File([poster], "poster.jpg", { type: "image/jpeg" }));
        const uploaded = await uploadMediaFile(body);
        if (uploaded.ok) {
          posterInput = {
            url: uploaded.url,
            storageKey: uploaded.storageKey,
            width: uploaded.width,
            height: uploaded.height,
            alt: `ภาพปกของวิดีโอ ${file.name}`,
          };
        }
      }

      setStage("กำลังตรวจสอบไฟล์ที่ปลายทาง");
      const fileName = target.publicUrl.split("/").pop()!;
      const confirmed = await confirmVideoUpload({ fileName, expectedBytes: file.size, poster: posterInput });
      if (!confirmed.ok) {
        setError(confirmed.message);
        return;
      }

      onComplete({
        url: confirmed.url,
        storageKey: target.storageKey,
        mimeType: confirmed.mimeType,
        width,
        height,
        durationSeconds: duration,
        posterMediaId: confirmed.posterMediaId,
      });
      setStage("อัปโหลดเสร็จแล้ว");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <fieldset className="admin-upload admin-field-wide">
      <legend>
        <Film aria-hidden="true" /> ไฟล์วิดีโอ
      </legend>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        disabled={busy}
        onChange={(event) => choose(event.target.files?.[0])}
      />
      <small>
        รองรับ MP4, MOV และ WebM ไม่เกิน 300MB — ไฟล์ส่งตรงจากเบราว์เซอร์ไปยังที่เก็บไฟล์
        ระบบจะอ่านความยาวและเก็บภาพปกจากวินาทีที่ 3 ให้อัตโนมัติ
      </small>

      {busy && (
        <div className="video-upload-progress" role="status">
          <p>
            <Upload aria-hidden="true" />
            {stage}
            {progress > 0 && ` · ${Math.round(progress * 100)}%`}
          </p>
          <div
            className="storage-bar"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ inlineSize: `${Math.max(2, progress * 100)}%` }} />
          </div>
        </div>
      )}

      {!busy && stage === "อัปโหลดเสร็จแล้ว" && <p role="status">{stage}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </fieldset>
  );
}
