import "dotenv/config";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * QR codes are the one part of this archive that gets printed and glued to a physical boat.
 * A code that stops resolving cannot be fixed by editing a page — the sticker is already out
 * there — so every branch of the resolver is covered here.
 */

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("รหัสผ่าน").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("a scanned code lands on its content and is counted", async ({ page }) => {
  // The scan counter is read from the admin list, which is the only place an editor sees it.
  await login(page);
  await page.goto("/admin/qr-codes");
  const row = page.getByRole("row").filter({ hasText: "/q/boat-2568" });
  const before = Number((await row.innerText()).match(/(\d+) scans/)?.[1] ?? "-1");
  expect(before).toBeGreaterThanOrEqual(0);

  await page.goto("/q/boat-2568");
  await expect(page).toHaveURL(/\/boats\/rua-phra-wat-rattanaram-2568$/);

  await page.goto("/admin/qr-codes");
  await expect(page.getByRole("row").filter({ hasText: "/q/boat-2568" })).toContainText(`${before + 1} scans`);
});

test("each target kind resolves to a page that exists", async ({ page }) => {
  for (const [code, pattern] of [
    ["lai-kradat", /\/patterns\//],
    ["chang-kradat", /\/masters\//],
    ["craft", /\/craft$/],
  ] as const) {
    const response = await page.goto(`/q/${code}`);
    expect(response?.status(), `/q/${code} should resolve`).toBeLessThan(400);
    await expect(page, `/q/${code} should land on its content`).toHaveURL(pattern);
  }
});

test("an unknown code answers 404 and still explains itself", async ({ page }) => {
  const response = await page.goto("/q/definitely-not-a-real-code");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "ไม่พบรหัสนี้ในคลัง" })).toBeVisible();
  await expect(page.getByRole("link", { name: "กลับหน้าหลัก" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("the print sheet renders a scannable square for every active code", async ({ page }) => {
  await login(page);
  await page.goto("/admin/qr-codes");
  await page.getByRole("link", { name: "พิมพ์ป้าย QR" }).click();
  await expect(page).toHaveURL(/\/admin\/qr-print$/);

  const cards = page.locator(".qr-print-card");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);

  // An SVG with no modules would still be a visible element, so assert the square has paths.
  const rects = await cards.first().locator(".qr-print-image svg *").count();
  expect(rects, "the QR square should contain drawn modules").toBeGreaterThan(0);

  // The printed code must be readable as text, for anyone whose camera will not focus.
  await expect(cards.filter({ hasText: "boat-2568" })).toHaveCount(1);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("the print sheet refuses to pretend localhost is a real address", async ({ page }) => {
  // Playwright runs against localhost, so the warning must be present here. If it ever
  // disappears, stickers pointing at a laptop could be printed without anyone noticing.
  await login(page);
  await page.goto("/admin/qr-print");
  // Scoped to the warning itself: Next renders its own empty role="alert" route announcer.
  await expect(page.locator(".qr-print-warning")).toContainText("localhost");
});
