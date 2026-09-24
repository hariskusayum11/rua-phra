import "dotenv/config";
import { Client } from "pg";
const client=new Client({connectionString:process.env.DATABASE_URL});
await client.connect();
try {
  const sections=await client.query(`DELETE FROM "BoatSection" WHERE slug LIKE 'browser-hotspot-%'`);
  const materials=await client.query(`DELETE FROM "Material" WHERE slug LIKE 'browser-material-%'`);
  const processes=await client.query(`DELETE FROM "KnowledgeProcess" WHERE slug LIKE 'browser-process-%'`);
  const temples=await client.query(`DELETE FROM "Temple" WHERE slug LIKE 'browser-temple-%'`);
  const media=await client.query(`DELETE FROM "Media" WHERE alt LIKE 'ภาพทดสอบการอัปโหลด%'`);
  console.log({sections:sections.rowCount,materials:materials.rowCount,processes:processes.rowCount,temples:temples.rowCount,media:media.rowCount});
} finally { await client.end(); }
