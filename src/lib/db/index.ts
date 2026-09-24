import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalDb = globalThis as unknown as { prisma?: PrismaClient };

function createDatabaseClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required. Configure it before accessing the database.");
  }
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
    }),
  });
}

// Defer initialization so static pages can build without a database connection.
export function getDb(): PrismaClient {
  globalDb.prisma ??= createDatabaseClient();
  return globalDb.prisma;
}
