/**
 * Does every photograph the archive thinks it has actually exist?
 *
 * Read-only. It never deletes anything, which is the whole point: the script that did the
 * deleting is how nine field photographs were lost, and the job of noticing a problem
 * should not be done by the same code that is allowed to act on it.
 *
 * A Media row whose file is gone renders as a broken image on the public site — worse than
 * an empty frame, because the empty frame says so and the broken one looks like a fault in
 * the site. This finds them before a visitor does.
 *
 *   npx tsx scripts/check-media-files.mjs                 # the database in DATABASE_URL
 *   CHECK_DB_URL=<production url> npx tsx scripts/check-media-files.mjs
 */
import "dotenv/config";
import { Client } from "pg";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { objectStore } from "../src/lib/media-storage.ts";

const store = objectStore();
if (!store) {
  console.log("ยังไม่ได้ตั้งค่าที่เก็บไฟล์ภายนอก ไม่มีอะไรให้ตรวจ");
  process.exit(0);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${store.accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: store.accessKeyId, secretAccessKey: store.secretAccessKey },
});

const present = new Set();
let token;
do {
  const page = await s3.send(new ListObjectsV2Command({ Bucket: store.bucket, ContinuationToken: token }));
  for (const object of page.Contents ?? []) present.add(object.Key);
  token = page.IsTruncated ? page.NextContinuationToken : undefined;
} while (token);

const connectionString = process.env.CHECK_DB_URL || process.env.DATABASE_URL;
const client = new Client({ connectionString });
await client.connect();

try {
  const { rows } = await client.query(`
    SELECT m.id, m.alt, m.url, m.kind,
           COALESCE(
             (SELECT string_agg(b.name || ' (ภาพปก)', ', ') FROM "Boat" b WHERE b."coverMediaId" = m.id),
             (SELECT string_agg(s.name || ' (จุดสำรวจ)', ', ') FROM "BoatSection" s WHERE s."closeupMediaId" = m.id),
             (SELECT string_agg(p.name || ' (ลวดลาย)', ', ') FROM "Pattern" p WHERE p."imageMediaId" = m.id),
             (SELECT string_agg(ma.name || ' (ภาพช่าง)', ', ') FROM "Master" ma WHERE ma."portraitMediaId" = m.id),
             'ยังไม่ได้ผูกกับรายการใด'
           ) AS used_by
    FROM "Media" m
    WHERE m.url IS NOT NULL AND m.url LIKE 'http%'
    ORDER BY used_by`);

  const missing = rows.filter((row) => !present.has(row.url.split("/").pop()));

  console.log(`ฐานข้อมูล: ${new URL(connectionString).host}`);
  console.log(`ที่เก็บไฟล์: ${store.bucket} · ${present.size} ไฟล์`);
  console.log(`ระเบียนสื่อที่ชี้ไปที่เก็บไฟล์: ${rows.length} · หาไฟล์ไม่เจอ: ${missing.length}`);

  if (missing.length > 0) {
    console.table(missing.map((row) => ({
      "ใช้ที่": row.used_by,
      "คำบรรยาย": (row.alt ?? "").slice(0, 44),
      "ไฟล์ที่หาไม่เจอ": row.url.split("/").pop(),
    })));
    process.exitCode = 1;
  }
} finally {
  await client.end();
}
