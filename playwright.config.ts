import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  // The admin specs write real rows; clear them before and after so runs stay independent.
  globalSetup: "./tests/fixtures-clean.ts",
  globalTeardown: "./tests/fixtures-clean.ts",
  use: { baseURL: "http://127.0.0.1:3100", channel: "msedge" },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
  },
  reporter: "list",
});
