import "dotenv/config";
import { Client } from "pg";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { objectStore } from "../src/lib/media-storage.ts";

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

let removed;
try {
  const sections = await client.query(`DELETE FROM "BoatSection" WHERE slug LIKE 'browser-hotspot-%'`);
  const materials = await client.query(`DELETE FROM "Material" WHERE slug LIKE 'browser-material-%'`);
  const processes = await client.query(`DELETE FROM "KnowledgeProcess" WHERE slug LIKE 'browser-process-%'`);
  const temples = await client.query(`DELETE FROM "Temple" WHERE slug LIKE 'browser-temple-%'`);
  // The files belonging to these rows are deleted further down, so the urls are read
  // before the rows go. RETURNING would do it in one statement; two is clearer about the
  // fact that the second deletion is driven by exactly this list and nothing else.
  const doomedMedia = await client.query(`SELECT url FROM "Media" WHERE alt LIKE 'ภาพทดสอบการอัปโหลด%' AND url IS NOT NULL`);
  const media = await client.query(`DELETE FROM "Media" WHERE alt LIKE 'ภาพทดสอบการอัปโหลด%'`);
  // Lesson contents, quizzes and verification rows cascade from the lesson itself.
  const lessons = await client.query(`DELETE FROM "Lesson" WHERE slug LIKE 'browser-lesson-%'`);
  // The competition tests use a year far outside the recorded range, so a leftover can
  // never be mistaken for a real one. Placings cascade from the year.
  const years = await client.query(`DELETE FROM "CompetitionYear" WHERE year >= 2690`);

  /**
   * The files those rows pointed at.
   *
   * Only those. An earlier version of this swept the bucket for `upload-*` objects that no
   * Media row referenced and deleted them as orphans — which is correct only when the
   * database and the bucket belong to the same deployment. On a developer's machine they do
   * not: DATABASE_URL is the local Postgres and R2_* in .env is the live bucket. Every
   * photograph the team had uploaded through the production admin was therefore an orphan
   * as far as this script could see, and running the test suite deleted nine of them.
   *
   * Deleting exactly the files whose rows this script just removed cannot do that: those
   * rows were created by the tests, on whichever database the tests ran against, and their
   * urls name the only objects that can be test leftovers. A file uploaded by anyone else
   * is never in the list, whatever database this is pointed at.
   */
  const store = objectStore();
  let removedFiles = 0;
  const keys = doomedMedia.rows
    .map((row) => row.url)
    .filter((url) => url.startsWith("http"))
    .map((url) => url.split("/").pop())
    .filter(Boolean)
    .map((Key) => ({ Key }));

  if (store && keys.length > 0) {
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${store.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: store.accessKeyId, secretAccessKey: store.secretAccessKey },
    });
    for (let start = 0; start < keys.length; start += 1000) {
      await s3.send(new DeleteObjectsCommand({
        Bucket: store.bucket,
        Delete: { Objects: keys.slice(start, start + 1000) },
      }));
    }
    removedFiles = keys.length;
  }

  removed = {
    sections: sections.rowCount,
    materials: materials.rowCount,
    processes: processes.rowCount,
    temples: temples.rowCount,
    media: media.rowCount,
    lessons: lessons.rowCount,
    competitionYears: years.rowCount,
    bucketFiles: removedFiles,
  };
} finally {
  await client.end();
}

console.log(removed);
