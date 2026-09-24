import "dotenv/config";
import { Client } from "pg";
const client = new Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'");
  const counts = [];
  for (const { tablename } of tables.rows) {
    const table = '"' + tablename.replaceAll('"', '""') + '"';
    const result = await client.query("SELECT count(*)::int AS count FROM " + table);
    if (result.rows[0].count) counts.push({ table: tablename, count: result.rows[0].count });
  }
  console.log(JSON.stringify({ nonEmptyTables: counts, tableCount: tables.rows.length }, null, 2));
} finally { await client.end(); }
