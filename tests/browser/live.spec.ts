import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

/**
 * Checks the deployed site rather than a local build.
 *
 * Skipped unless `LIVE_URL` is set, because the rest of the suite must not reach out to a
 * production server on every run — and because a failure here means the deployment is
 * wrong, which is a different thing from the code being wrong.
 *
 *   $env:LIVE_URL = "https://ruaphra.vercel.app"
 *   npx playwright test live
 *
 * Reads the admin credentials from `.env.vercel`, the same file the hosting provider was
 * configured from, so the test signs in as the deployment actually expects rather than as
 * the developer's local copy does.
 */
const SITE = process.env.LIVE_URL?.replace(/\/+$/, "");

test.skip(!SITE, "ตั้ง LIVE_URL ก่อนจึงจะตรวจเว็บที่ deploy แล้ว");

function productionEnv() {
  try {
    return new Map(
      readFileSync(".env.vercel", "utf8")
        .split(/\r?\n/)
        .filter((line) => line.includes("=") && !line.startsWith("#"))
        .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]),
    );
  } catch {
    return new Map<string, string>();
  }
}

test("every public page answers and nothing is broken on the homepage", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(SITE!, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("เรือพระเล่าเรื่อง");

  // Present in the markup is not the same as loaded. A photograph served from the wrong
  // host still renders an <img>; it just never shows anything.
  const broken = await page.locator("img").evaluateAll((nodes) =>
    nodes.filter((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth === 0).length);
  expect(broken, "ภาพที่โหลดไม่ขึ้น").toBe(0);
  expect(errors.filter((error) => !/favicon/i.test(error)), "console errors").toEqual([]);
});

test("the procession video streams from the bucket", async ({ page, request }) => {
  await page.goto(`${SITE}/#procession`, { waitUntil: "networkidle" });
  const source = await page.locator(".home-procession-video source").getAttribute("src");
  expect(source).toBeTruthy();
  // A range request, because that is what a browser issues when someone presses play. A
  // host that answers 200 to this instead of 206 cannot be scrubbed through.
  const response = await request.get(source!, { headers: { Range: "bytes=0-2047" } });
  expect(response.status(), "ที่เก็บไฟล์ต้องรองรับการเล่นแบบสตรีม").toBe(206);
});

test("every QR code reaches its content", async ({ request }) => {
  for (const [code, destination] of [
    ["nithat", /\/exhibition$/],
    ["boat-2568", /\/boats\//],
    ["lai-kradat", /\/patterns\//],
    ["chang-kradat", /\/masters\//],
    ["craft", /\/craft$/],
  ] as const) {
    const response = await request.get(`${SITE}/q/${code}`, { maxRedirects: 0 });
    expect(response.status(), `/q/${code}`).toBe(307);
    expect(response.headers()["location"] ?? "", `/q/${code}`).toMatch(destination);
  }
  expect((await request.get(`${SITE}/q/definitely-not-real`)).status()).toBe(404);
});

test("the exhibition page fits a phone and offers its ways in", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${SITE}/exhibition`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "หน้าล้นจอแนวนอนบนมือถือ").toBeLessThanOrEqual(1);
  expect(await page.locator(".exhibit-doors a").count()).toBeGreaterThan(4);
});

test("the admin is reachable and knows where files are kept", async ({ page }) => {
  const env = productionEnv();
  test.skip(!env.get("ADMIN_PASSWORD"), "ไม่พบ .env.vercel จึงข้ามการตรวจระบบจัดการ");

  await page.goto(`${SITE}/login`);
  await page.getByLabel("อีเมล").fill(env.get("ADMIN_EMAIL")!);
  await page.getByLabel("รหัสผ่าน").fill(env.get("ADMIN_PASSWORD")!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  // Signing in must land on the address the site was deployed at. Landing somewhere else
  // means AUTH_URL still points at an older name — the same value the printed QR codes
  // are built from, so getting it wrong here is getting the stickers wrong.
  expect(new URL(page.url()).origin, "เข้าสู่ระบบแล้วถูกพาไปคนละที่อยู่").toBe(SITE);

  await page.goto(`${SITE}/admin/storage`);
  await expect(page.getByRole("heading", { level: 1, name: "พื้นที่เก็บไฟล์" })).toBeVisible();
  await expect(page.locator(".storage-card"), "ที่เก็บไฟล์ยังไม่ได้ตั้งค่าบนเซิร์ฟเวอร์").toBeVisible();
});

test("the QR sheet builds codes from the deployed address", async ({ page }) => {
  const env = productionEnv();
  test.skip(!env.get("ADMIN_PASSWORD"), "ไม่พบ .env.vercel จึงข้ามการตรวจหน้าพิมพ์ป้าย");

  await page.goto(`${SITE}/login`);
  await page.getByLabel("อีเมล").fill(env.get("ADMIN_EMAIL")!);
  await page.getByLabel("รหัสผ่าน").fill(env.get("ADMIN_PASSWORD")!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  await page.goto(`${SITE}/admin/qr-print`);
  await expect(page.locator(".qr-print-card").first()).toBeVisible();
  // Printed stickers cannot be corrected, so the address they carry is checked here rather
  // than discovered after a hundred of them are glued to a board.
  await expect(page.locator(".qr-print-controls")).toContainText(`${SITE}/q/`);
  await expect(page.locator(".qr-print-warning"), "ยังชี้ไปที่อยู่ที่สแกนไม่ได้").toHaveCount(0);
});
