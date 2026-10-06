import path from "node:path";

/**
 * Where uploaded media lives.
 *
 * Two backends, chosen by whether object storage is configured:
 *
 * **Object storage (production).** Cloudflare R2 over the S3 API. Needed because the site
 * runs on a host with no persistent disk — a file written beside the server is gone the
 * next time the server moves, and an editor would have no way of knowing until a
 * photograph stopped loading weeks later.
 *
 * **Local disk (development and tests).** Keeps the project runnable with nothing but a
 * database, so nobody needs cloud credentials to work on it or to run the suite.
 *
 * The switch is the presence of credentials, not a flag, so a deployment cannot be half
 * configured: either all four values are set and uploads go to the bucket, or none are and
 * they go to disk.
 */

export const uploadRoot = path.join(process.cwd(), "storage", "uploads");

export type ObjectStoreConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Public base URL the bucket is served from, without a trailing slash. */
  publicBase: string;
};

/** Returns the object-store settings, or null when the local disk should be used. */
export function objectStore(): ObjectStoreConfig | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET?.trim();
  const publicBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim().replace(/\/+$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBase };
}

/** The address a stored file is served from, for either backend. */
export function uploadUrl(fileName: string) {
  const store = objectStore();
  return store ? `${store.publicBase}/${fileName}` : `/media/${fileName}`;
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
