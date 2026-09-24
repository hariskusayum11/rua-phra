import "dotenv/config";
import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("รหัสผ่าน").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("an editor can add a temple without touching a script", async ({ page }) => {
  await login(page);
  const slug = `browser-temple-${Date.now()}`;
  await page.goto("/admin/temples/new");
  await page.getByLabel("ชื่อวัด").fill("วัดทดสอบจากเบราว์เซอร์");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("ชุมชน / ที่ตั้ง").fill("ชุมชนทดสอบ อำเภอปากพะยูน");
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("สร้างรายการแล้ว");

  // The new temple is immediatelyselectable when creating a boat.
  await page.goto("/admin/boats/new");
  await expect(page.locator('select[name="templeId"]')).toContainText("วัดทดสอบจากเบราว์เซอร์");

  await page.goto(`/admin/temples`);
  await page.getByRole("row", { name: /วัดทดสอบจากเบราว์เซอร์/ }).getByRole("link", { name: "แก้ไข" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "ลบรายการ" }).click();
  await expect(page).toHaveURL(/\/admin\/temples$/);
});

test("an editor can upload a photograph and reuse it as a boat cover", async ({ page }) => {
  await login(page);
  await page.goto("/admin/media/new");
  await page.setInputFiles('input[type="file"]', path.join(process.cwd(), "tests", "fixtures", "upload-sample.jpg"));
  // The upload runs on choose; the preview appears when the file has landed.
  await expect(page.locator(".admin-upload .admin-media-preview")).toBeVisible({ timeout: 20_000 });

  const alt = `ภาพทดสอบการอัปโหลด ${Date.now()}`;
  await page.getByLabel("คำบรรยายภาพ").fill(alt);
  await page.getByLabel("ผู้ถ่าย").fill("ผู้ทดสอบระบบ");
  await page.getByLabel("จุดโฟกัส X (%)").fill("40");
  await page.getByLabel("จุดโฟกัส Y (%)").fill("30");
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("สร้างรายการแล้ว");
  // Saving redirects to the record's own URL; reloading before that lands on the blank form.
  await expect(page).toHaveURL(/\/admin\/media\/[0-9a-f-]+$/);

  // Stored metadata survives a reload, and the file is actually served.
  await page.reload();
  await expect(page.getByLabel("จุดโฟกัส X (%)")).toHaveValue("40");
  const src = await page.locator(".admin-upload .admin-media-preview img").getAttribute("src");
  expect(src).toBeTruthy();
  const response = await page.request.get(src!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/webp");

  // And it is offered as a cover image elsewhere in the admin.
  await page.goto("/admin/boats/new");
  await expect(page.locator('select[name="coverMediaId"]')).toContainText(alt);

  await page.goto("/admin/media");
  // The full alt, because every run's alt starts with the same words.
  await page.getByRole("row", { name: new RegExp(alt) }).getByRole("link", { name: "แก้ไข" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "ลบรายการ" }).click();
  await expect(page).toHaveURL(/\/admin\/media$/);
});

test("linking a pattern to a boat from the admin reaches the public page", async ({ page }) => {
  await login(page);
  await page.goto("/admin/patterns");
  await page.getByRole("row", { name: /ลายเกล็ดพญานาค/ }).getByRole("link", { name: "แก้ไข" }).click();

  const boats = page.locator(".admin-relations").filter({ hasText: "เรือที่ใช้ลายนี้" });
  await expect(boats).toBeVisible();
  const first = boats.locator('input[type="checkbox"]').first();
  const wasChecked = await first.isChecked();

  // Toggle off, save, confirm it persisted, then restore.
  await first.setChecked(!wasChecked);
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("บันทึกการแก้ไขแล้ว");
  await page.reload();
  await expect(boats.locator('input[type="checkbox"]').first()).toBeChecked({ checked: !wasChecked });

  await boats.locator('input[type="checkbox"]').first().setChecked(wasChecked);
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("บันทึกการแก้ไขแล้ว");
  await page.reload();
  await expect(boats.locator('input[type="checkbox"]').first()).toBeChecked({ checked: wasChecked });
});
