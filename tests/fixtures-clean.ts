import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Removes the records the admin browser tests create.
 *
 * Those tests write real rows through the real forms, which is the point of them — but a
 * run that fails partway leaves its rows behind, and the next run then trips over its own
 * leftovers: duplicate slugs, colliding hotspot positions, `getByRole("row")` matching ten
 * elements instead of one. Cleaning at both ends of the run keeps each one independent.
 *
 * Playwright loads this file as CommonJS, so the project root comes from the working
 * directory rather than import.meta.
 */
export default function cleanBrowserFixtures() {
  execFileSync(process.execPath, [path.join("scripts", "cleanup-browser-fixtures.mjs")], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}
