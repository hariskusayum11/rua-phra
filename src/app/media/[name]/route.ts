import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { CONTENT_TYPES, resolveUpload } from "@/lib/media-storage";

/**
 * Serves an uploaded file from storage/uploads.
 *
 * Uploads cannot live in public/ (Next reads that directory once at startup), so they are
 * read from disk per request here. The name is validated before it touches the filesystem.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const filePath = resolveUpload(name);
  if (!filePath) return new Response("Not found", { status: 404 });

  const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()];
  if (!contentType) return new Response("Not found", { status: 404 });

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const file = await readFile(filePath);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        // The name contains a uuid, so a stored file never changes under the same URL.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
