import "server-only";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { objectStore, type ObjectStoreConfig } from "@/lib/media-storage";

/**
 * Writing to Cloudflare R2 through its S3-compatible API.
 *
 * Kept apart from `media-storage` so that module stays importable from anywhere, including
 * the browser bundle — it only answers "where does a file live", and this one is the half
 * that needs credentials and a network.
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
