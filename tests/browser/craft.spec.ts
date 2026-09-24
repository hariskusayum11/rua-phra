import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("desktop craft page presents all database steps as a sticky editorial timeline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/craft");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("จากกระดาษ");
  await expect(page.locator(".process-timeline > li")).toHaveCount(7);
  await expect(page.locator(".process-sticky")).toHaveCSS("position", "sticky");
  // Verified content drops the notice; anything short of that has to keep saying so.
  await expect(page.locator(".demo-notice")).toContainText("รอการตรวจสอบ");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "test-results/craft-desktop.png", fullPage: true });
});

test("mobile craft timeline becomes vertical and remains readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/craft");
  await expect(page.locator(".process-story")).toHaveCSS("grid-template-columns", "358px");
  await expect(page.locator(".process-sticky")).toHaveCSS("position", "static");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/craft-mobile.png", fullPage: true });
});

test("step detail exposes every supported knowledge section with honest media state", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/craft/prepare-materials-demo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("เตรียมวัสดุ");
  await expect(page.locator(".demo-notice")).toContainText("รอการตรวจสอบ");
  await expect(page.getByRole("heading", { name: "มองกระบวนการทีละจังหวะ" })).toBeVisible();
  await expect(page.getByText("ยังไม่มีวิดีโอภาคสนามสำหรับขั้นตอนนี้")).toBeVisible();
  await expect(page.getByRole("heading", { name: "วัสดุ", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "เครื่องมือ", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "เทคนิค", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "คำแนะนำจากช่าง" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ข้อควรระวัง" })).toBeVisible();
  await expect(page.getByText("ลายกระหนกใบเทศ")).toBeVisible();
  await expect(page.getByText("ช่างสมชาย บุญช่วย")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("step detail reflows on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/craft/paper-cutting-demo");
  await expect(page.locator(".step-hero")).toHaveCSS("grid-template-columns", "288px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
