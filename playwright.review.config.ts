import { defineConfig } from "@playwright/test";

// Public checks only: no admin mutations, fixture setup, or object-storage cleanup.
// Run against an already started local production server.
export default defineConfig({
  testDir: "./tests/browser",
  testMatch: ["home.spec.ts", "motion.spec.ts", "collections.spec.ts", "shell.spec.ts", "craft.spec.ts", "boat-explorer.spec.ts", "links.spec.ts"],
  use: { baseURL: process.env.REVIEW_URL ?? "http://127.0.0.1:3100", channel: "msedge" },
  workers: 2,
  reporter: "list",
});
