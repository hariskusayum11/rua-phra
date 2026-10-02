import { createRequire } from "node:module";
import { defineConfig } from "prisma/config";

// Loading .env is a development convenience. In a container the values arrive as real
// environment variables and dotenv is not installed at all, so a hard import here would
// stop `prisma migrate deploy` from running on startup — the one moment it matters most.
try {
  createRequire(import.meta.url)("dotenv/config");
} catch {
  // No dotenv and no .env file: the environment is already set.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  // Generation and static builds do not require a live database.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
