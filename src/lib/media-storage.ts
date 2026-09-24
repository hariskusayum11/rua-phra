import path from "node:path";

/**
 * Where uploaded media lives on disk.
 *
 * Deliberately outside public/. Next reads the public directory when the server starts, so
 * a file written there while the server is running is not served until a restart — an
 * editor would upload a photograph and watch it 404. Uploads are served by a route handler
 * instead, which reads from disk on every request. Keeping them out of public/ also keeps
 * them out of the build artifact, so a redeploy cannot silently drop them.
 */
export const uploadRoot = path.join(process.cwd(), "storage", "uploads");

/** The public path that maps to a stored file. */
export function uploadUrl(fileName: string) {
  return `/media/${fileName}`;
}

const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

/**
 * Resolves a requested name to a file inside the upload root, or null.
 *
 * Both checks matter: the character allow-list rejects separators and traversal outright,
 * and the resolved-prefix check is the backstop that catches anything the first misses.
 */
export function resolveUpload(fileName: string): string | null {
  if (!SAFE_NAME.test(fileName)) return null;
  const resolved = path.resolve(uploadRoot, fileName);
  const root = path.resolve(uploadRoot);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

export const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
};
