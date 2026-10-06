import "dotenv/config";
import { Client } from "pg";
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { objectStore } from "../src/lib/media-storage.ts";

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

let removed;
try {
  const sections = await client.query(`DELETE FROM "BoatSection" WHERE slug LIKE 'browser-hotspot-%'`);
  const materials = await client.query(`DELETE FROM "Material" WHERE slug LIKE 'browser-material-%'`);
  const processes = await client.query(`DELETE FROM "KnowledgeProcess" WHERE slug LIKE 'browser-process-%'`);
  const temples = await client.query(`DELETE FROM "Temple" WHERE slug LIKE 'browser-temple-%'`);
  const media = await client.query(`DELETE FROM "Media" WHERE alt LIKE 'ภาพทดสอบการอัปโหลด%'`);
  // Lesson contents, quizzes and verification rows cascade from the lesson itself.
  const lessons = await client.query(`DELETE FROM "Lesson" WHERE slug LIKE 'browser-lesson-%'`);

  /**
   * Files the tests uploaded, which now land in object storage rather than on disk.
   *
   * The admin tests upload through the real form, which is the point of them — but once a
   * bucket is configured locally, that bucket is the live one. Deleting the rows without
   * deleting the files would leave the project paying storage for test fixtures and reading
   * a usage figure that is quietly wrong.
   *
   * Only objects with no row pointing at them are removed, so a real photograph uploaded by
   * an editor is never touched by a test run.
   */
  const store = objectStore();
  let orphans = 0;
  if (store) {
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${store.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: store.accessKeyId, secretAccessKey: store.secretAccessKey },
    });
    const { rows } = await client.query(`SELECT url FROM "Media" WHERE url IS NOT NULL`);
    const live = new Set(rows.map((row) => row.url.split("/").pop()));

    let token;
    const doomed = [];
    do {
      const page = await s3.send(new ListObjectsV2Command({ Bucket: store.bucket, ContinuationToken: token }));
      for (const object of page.Contents ?? []) {
        if (object.Key.startsWith("upload-") && !live.has(object.Key)) doomed.push({ Key: object.Key });
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);

    for (let start = 0; start < doomed.length; start += 1000) {
      await s3.send(new DeleteObjectsCommand({
        Bucket: store.bucket,
        Delete: { Objects: doomed.slice(start, start + 1000) },
      }));
    }
    orphans = doomed.length;
  }

  removed = {
    sections: sections.rowCount,
    materials: materials.rowCount,
    processes: processes.rowCount,
    temples: temples.rowCount,
    media: media.rowCount,
    lessons: lessons.rowCount,
    bucketFiles: orphans,
  };
} finally {
  await client.end();
}

console.log(removed);
