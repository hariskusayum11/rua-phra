"use client";

/**
 * Shrinks a photograph in the browser before it is sent to the server.
 *
 * Two reasons, and the first is the one that decides it. A serverless host caps how large
 * a request body may be — on the free tier that cap is a few megabytes, and a photograph
 * straight off a camera is routinely larger. Without this, uploading a real field photo
 * fails with a platform error the editor cannot act on.
 *
 * The second is that the server was already going to resize it to the same dimension, so
 * sending twelve megabytes across a phone connection at the temple buys nothing.
 *
 * This is **not** the EXIF-stripping step. Drawing to a canvas does discard the metadata
 * block, but the server re-encodes with sharp regardless, because a guarantee about GPS
 * coordinates in field photography cannot rest on code running in someone's browser.
 *
 * On anything unexpected — no canvas, a format the browser cannot decode, a blob that
 * comes back larger than the original — the original file is returned and the server deals
 * with it. A degraded upload beats a refused one.
 */
const MAX_EDGE = 2400;

export async function downscaleImage(file: File): Promise<File> {
  if (typeof document === "undefined" || !("createImageBitmap" in window)) return file;

  let bitmap: ImageBitmap;
  try {
    // `imageOrientation` applies the EXIF rotation while decoding, so a phone photo does
    // not come out sideways once the metadata that described the rotation is gone.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    // Already small enough and already a format the server handles: leave it alone.
    if (scale === 1 && file.size <= 3 * 1024 * 1024) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.9);
    });
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}

/**
 * The largest body a serverless host will accept, with room to spare for the form around
 * the file. Anything above this is refused in the browser with an explanation, rather than
 * being sent and coming back as a platform error the editor cannot act on.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
