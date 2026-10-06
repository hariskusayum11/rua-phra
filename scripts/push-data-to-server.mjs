/**
 * Copies the contents of the local database to a server database.
 *
 * The obvious way — `pg_dump --data-only --disable-triggers` piped into psql — does not
 * work against a managed Postgres. Turning triggers off is a superuser action, and a
 * managed provider does not hand out superuser, so the restore stops on the first foreign
 * key it meets. Setting `session_replication_role` is refused for the same reason.
 *
 * So the order is worked out instead of suppressed: read the foreign keys out of the target
 * schema, sort the tables so a row is never written before the row it points at, and copy
 * table by table. Self-referencing columns are filled on a second pass, because no ordering
 * of rows within one table can satisfy a cycle.
 *
 *   npx tsx scripts/push-data-to-server.mjs --dry-run
 *   npx tsx scripts/push-data-to-server.mjs
 *   npx tsx scripts/push-data-to-server.mjs --force    (overwrite a non-empty target)
 */
import "dotenv/config";
import pg from "pg";

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const sourceUrl = process.env.DATABASE_URL;
const targetUrl = process.env.NEON_DIRECT_URL;

if (!sourceUrl) {
  console.error("ไม่พบ DATABASE_URL — ต้องมีที่อยู่ฐานข้อมูลต้นทางใน .env");
  process.exit(1);
}
if (!targetUrl) {
  console.error("ไม่พบ NEON_DIRECT_URL — ต้องใช้เส้นที่ไม่มีคำว่า -pooler");
  process.exit(1);
}

const source = new pg.Client({ connectionString: sourceUrl });
const target = new pg.Client({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });
await source.connect();
await target.connect();

const quote = (name) => `"${name.replace(/"/g, '""')}"`;

/** Tables that belong to the application, in whatever order the catalogue returns them. */
const { rows: tableRows } = await target.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    AND table_name <> '_prisma_migrations'
`);
const tables = tableRows.map((row) => row.table_name);

/** Which table each table points at, and which of its own columns point back at itself. */
const { rows: fkRows } = await target.query(`
  SELECT tc.table_name AS child, ccu.table_name AS parent, kcu.column_name AS column
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
`);

const dependsOn = new Map(tables.map((t) => [t, new Set()]));
const selfColumns = new Map(tables.map((t) => [t, new Set()]));
for (const { child, parent, column } of fkRows) {
  if (!dependsOn.has(child)) continue;
  if (child === parent) selfColumns.get(child).add(column);
  else dependsOn.get(child).add(parent);
}

/** Parents before children. A cycle between two tables would be a schema problem, not data. */
const ordered = [];
const placed = new Set();
while (ordered.length < tables.length) {
  const next = tables.filter((t) => !placed.has(t) && [...dependsOn.get(t)].every((p) => placed.has(p)));
  if (next.length === 0) {
    const stuck = tables.filter((t) => !placed.has(t));
    console.error("เรียงลำดับตารางไม่ได้ มีการอ้างอิงวนกัน:", stuck.join(", "));
    process.exit(1);
  }
  for (const table of next) {
    ordered.push(table);
    placed.add(table);
  }
}

// Refuse to write into a database that already holds something, unless told to.
if (!dryRun && !force) {
  for (const table of ordered) {
    const { rows } = await target.query(`SELECT 1 FROM ${quote(table)} LIMIT 1`);
    if (rows.length > 0) {
      console.error(`ตาราง ${table} บนเซิร์ฟเวอร์มีข้อมูลอยู่แล้ว`);
      console.error("ถ้าตั้งใจจะเขียนทับ ให้เติม --force");
      process.exit(1);
    }
  }
}

let totalRows = 0;
let copied = 0;
const deferred = [];

for (const table of ordered) {
  const { rows } = await source.query(`SELECT * FROM ${quote(table)}`);
  if (rows.length === 0) continue;

  const columns = Object.keys(rows[0]);
  const selfRefs = [...selfColumns.get(table)].filter((c) => columns.includes(c));

  if (dryRun) {
    console.log(`  ${table}: ${rows.length} แถว${selfRefs.length ? ` (เลื่อน ${selfRefs.join(", ")} ไปรอบสอง)` : ""}`);
    totalRows += rows.length;
    copied += 1;
    continue;
  }

  if (force) await target.query(`DELETE FROM ${quote(table)}`);

  // Written in batches: one statement per row is thousands of round trips to Singapore,
  // and one statement for everything exceeds the parameter limit.
  const BATCH = 200;
  for (let start = 0; start < rows.length; start += BATCH) {
    const slice = rows.slice(start, start + BATCH);
    const values = [];
    const tuples = slice.map((row) => {
      const placeholders = columns.map((column) => {
        const blank = selfRefs.includes(column);
        values.push(blank ? null : row[column]);
        return `$${values.length}`;
      });
      return `(${placeholders.join(", ")})`;
    });
    await target.query(
      `INSERT INTO ${quote(table)} (${columns.map(quote).join(", ")}) VALUES ${tuples.join(", ")}`,
      values,
    );
  }

  // A column pointing at this same table can only be filled once every row exists.
  for (const column of selfRefs) {
    for (const row of rows) {
      if (row[column] == null) continue;
      await target.query(`UPDATE ${quote(table)} SET ${quote(column)} = $1 WHERE id = $2`, [row[column], row.id]);
      deferred.push(`${table}.${column}`);
    }
  }

  console.log(`  ${table}: ${rows.length} แถว`);
  totalRows += rows.length;
  copied += 1;
}

console.log(
  `\n${dryRun ? "ทดลองรัน ไม่ได้เขียนอะไร" : "คัดลอกแล้ว"} ${copied} ตาราง รวม ${totalRows} แถว`,
);
if (deferred.length > 0) console.log(`เติมค่าที่อ้างถึงตัวเองภายหลัง ${deferred.length} จุด`);

await source.end();
await target.end();
