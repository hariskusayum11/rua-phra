import { HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { objectStore, storageCeiling, type ObjectStoreConfig } from "../media-storage";

/**
 * Writing to Cloudflare R2 through its S3-compatible API.
 *
 * Kept apart from `media-storage` so that module stays importable from anywhere, including
 * the browser bundle — it only answers "where does a file live", and this one is the half
 * that needs credentials and a network.
 *
 * Plain module rather than server-only: the field import script runs outside Next and
 * needs the same code. `object-store.ts` re-exports it behind the server-only guard for
 * everything inside the app. Credentials cannot reach a browser either way — none of them
 * carry the prefix that would put them in the client bundle.
 *
 * The client is built once per configuration. Rebuilding it per upload re-reads the
 * credentials and opens a fresh connection pool for a request that is already slow.
 */
let cached: { key: string; client: S3Client } | null = null;

function clientFor(config: ObjectStoreConfig) {
  const key = `${config.accountId}:${config.bucket}:${config.accessKeyId}`;
  if (cached?.key === key) return cached.client;
  const client = new S3Client({
    // R2 ignores the region but the S3 client insists on one.
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
  cached = { key, client };
  return client;
}

/**
 * Stores one file and returns the address it is served from.
 *
 * Returns null when no object store is configured, which is the signal to fall back to the
 * local disk rather than an error — development and the test suite run that way on purpose.
 */
export async function putObject(fileName: string, body: Buffer, contentType: string): Promise<string | null> {
  const config = objectStore();
  if (!config) return null;

  await clientFor(config).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: fileName,
      Body: body,
      ContentType: contentType,
      // Uploaded media is addressed by a name containing a UUID and never replaced in
      // place, so it can be cached for as long as anything is willing to keep it.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${config.publicBase}/${fileName}`;
}

/**
 * How much of the free allowance the bucket is using.
 *
 * Measured by listing the bucket rather than by asking an analytics API, so it needs no
 * second credential and reports what is actually stored right now. Listing costs one
 * operation per thousand objects — against an allowance of a million a month, the
 * measurement is free in any sense that matters.
 */
export type BucketUsage = { bytes: number; objects: number; limitBytes: number; measuredAt: Date };

let usageCache: { at: number; value: BucketUsage } | null = null;
const USAGE_TTL_MS = 60_000;

export async function bucketUsage(options?: { fresh?: boolean }): Promise<BucketUsage | null> {
  const config = objectStore();
  if (!config) return null;
  if (!options?.fresh && usageCache && Date.now() - usageCache.at < USAGE_TTL_MS) return usageCache.value;

  const client = clientFor(config);
  let bytes = 0;
  let objects = 0;
  let token: string | undefined;

  try {
    do {
      const page = await client.send(
        new ListObjectsV2Command({ Bucket: config.bucket, ContinuationToken: token, MaxKeys: 1000 }),
      );
      for (const item of page.Contents ?? []) {
        bytes += item.Size ?? 0;
        objects += 1;
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
  } catch (error) {
    // Wrong credentials, a bucket that has been renamed, the network being down. The
    // admin page shows this as a state of its own rather than a 500, and an upload
    // treats an unknown size as a reason to refuse rather than to carry on.
    console.error("Could not measure bucket usage", error);
    return null;
  }

  const value: BucketUsage = { bytes, objects, limitBytes: storageCeiling(), measuredAt: new Date() };
  usageCache = { at: Date.now(), value };
  return value;
}

/**
 * A URL the browser may PUT one file to, directly.
 *
 * Videos do not fit through a server action — a serverless host caps the request body at a
 * few megabytes and a procession clip is tens. Signing a single-use URL lets the file go
 * from the editor's machine to the bucket without passing through the application at all,
 * which is also the only way the upload survives a slow connection at a temple.
 *
 * The signature pins the key and the content type, so the URL cannot be reused to write
 * something else, and it expires in fifteen minutes.
 */
export async function presignUpload(fileName: string, contentType: string, expiresIn = 900) {
  const config = objectStore();
  if (!config) return null;
  const url = await getSignedUrl(
    clientFor(config),
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: fileName,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { expiresIn },
  );
  return { url, publicUrl: `${config.publicBase}/${fileName}` };
}

/**
 * What the bucket actually holds at a key, or null.
 *
 * Used to confirm an upload the application never saw. A record is only written once the
 * file is known to be there at the size the browser claimed — otherwise a cancelled upload
 * would leave a video entry pointing at nothing.
 */
export async function headObject(fileName: string): Promise<{ bytes: number; contentType: string } | null> {
  const config = objectStore();
  if (!config) return null;
  try {
    const result = await clientFor(config).send(new HeadObjectCommand({ Bucket: config.bucket, Key: fileName }));
    return { bytes: result.ContentLength ?? 0, contentType: result.ContentType ?? "application/octet-stream" };
  } catch {
    return null;
  }
}
