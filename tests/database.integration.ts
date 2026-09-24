import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  let checks = 0;
  async function rejects(sql: string, values: unknown[], expectedCode: string) {
    await client.query("SAVEPOINT integrity_check");
    await assert.rejects(client.query(sql, values), (error: unknown) => {
      return typeof error === "object" && error !== null && "code" in error && error.code === expectedCode;
    });
    await client.query("ROLLBACK TO SAVEPOINT integrity_check");
    checks++;
  }
  try {
    await client.query("BEGIN");
    const temple = randomUUID(), boat = randomUUID(), source = randomUUID(), reviewer = randomUUID();
    await client.query('INSERT INTO "Temple" (id, name, slug, community) VALUES ($1, $1, $1, $1)', [temple]);
    await client.query('INSERT INTO "Boat" (id, slug, name, year, concept, summary, image, "templeId") VALUES ($1, $1, $1, 2569, $1, $1, $1, $2)', [boat, temple]);
    await client.query('INSERT INTO "KnowledgeSource" (id, title) VALUES ($1, $1)', [source]);
    await client.query('INSERT INTO "User" (id, email) VALUES ($1, $2)', [reviewer, reviewer + "@example.invalid"]);
    await rejects('INSERT INTO "KnowledgeSourceLink" (id, "sourceId") VALUES ($1, $2)', [randomUUID(), source], "23514");
    await rejects('INSERT INTO "KnowledgeSourceLink" (id, "sourceId", "boatId") VALUES ($1, $2, $3)', [randomUUID(), source, randomUUID()], "23503");
    await rejects('INSERT INTO "KnowledgeSourceLink" (id, "sourceId", "boatId", "masterId") VALUES ($1, $2, $3, $4)', [randomUUID(), source, boat, randomUUID()], "23514");
    await rejects('INSERT INTO "ContentVerification" (id, "boatId", status) VALUES ($1, $2, \'VERIFIED\')', [randomUUID(), boat], "23514");
    await rejects('INSERT INTO "ContentVerification" (id, "boatId", status, "verifiedById", "verifiedAt") VALUES ($1, $2, \'VERIFIED\', $3, NOW())', [randomUUID(), boat, randomUUID()], "23503");
    await client.query('INSERT INTO "ContentVerification" (id, "boatId", status, "verifiedById", "verifiedAt") VALUES ($1, $2, \'VERIFIED\', $3, NOW())', [randomUUID(), boat, reviewer]);
    await rejects('INSERT INTO "ContentVerification" (id, "boatId") VALUES ($1, $2)', [randomUUID(), boat], "23505");
    await rejects('INSERT INTO "BoatSection" (id, name, x, y, description, "boatId") VALUES ($1, $1, 101, 50, $1, $2)', [randomUUID(), boat], "23514");
    await rejects('INSERT INTO "QRCode" (id, code, label, "targetPath") VALUES ($1, $1, $1, $2)', [randomUUID(), "//evil.example"], "23514");
    await client.query('INSERT INTO "KnowledgeSourceLink" (id, "sourceId", "boatId") VALUES ($1, $2, $3)', [randomUUID(), source, boat]);
    await client.query('DELETE FROM "Boat" WHERE id = $1', [boat]);
    assert.equal((await client.query('SELECT id FROM "KnowledgeSourceLink" WHERE "boatId" = $1', [boat])).rowCount, 0);
    assert.equal((await client.query('SELECT id FROM "ContentVerification" WHERE "boatId" = $1', [boat])).rowCount, 0);
    console.log(`Passed ${checks} database rejection checks and source/verification cascade checks. All fixture changes rolled back.`);
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
