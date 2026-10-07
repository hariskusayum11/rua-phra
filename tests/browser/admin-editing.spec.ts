import "dotenv/config";
import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import os from "node:os";
import { rm, stat } from "node:fs/promises";
import sharp from "sharp";

/** Saving returns to the list, so inspecting what was saved means going back in. */
async function reopen(page: Page, resource: string, label: string | RegExp) {
  await expect(page).toHaveURL(new RegExp(`/admin/${resource}$`));
  await page.getByRole("row").filter({ hasText: label }).getByRole("link", { name: "แก้ไข" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/${resource}/[0-9a-f-]+$`));
}

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
  await expect(page).toHaveURL(/\/admin\/temples$/);
  await expect(page.locator(".admin-feedback")).toContainText("เพิ่มวัดแล้ว");

  // The new temple is immediately selectable when creating a boat.
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
  await page.setInputFiles('input[accept^="image"]', path.join(process.cwd(), "tests", "fixtures", "upload-sample.jpg"));
  // The upload runs on choose; the preview appears when the file has landed.
  await expect(page.locator(".admin-upload .admin-media-preview")).toBeVisible({ timeout: 20_000 });

  const alt = `ภาพทดสอบการอัปโหลด ${Date.now()}`;
  await page.getByLabel("คำบรรยายภาพ").fill(alt);
  await page.getByLabel("ผู้ถ่าย").fill("ผู้ทดสอบระบบ");
  await page.getByLabel("จุดโฟกัส X (%)").fill("40");
  await page.getByLabel("จุดโฟกัส Y (%)").fill("30");
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("เพิ่มไฟล์สื่อแล้ว");

  // Stored metadata survives the round trip, and the file is actually served.
  await reopen(page, "media", alt);
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
  await expect(page.locator(".admin-feedback")).toContainText("บันทึกการแก้ไขลวดลายแล้ว");
  // Saving replaces the form in history rather than stacking on it, so going back lands
  // wherever the editor came from. Reopen from the list instead.
  await reopen(page, "patterns", "ลายเกล็ดพญานาค");
  await expect(boats.locator('input[type="checkbox"]').first()).toBeChecked({ checked: !wasChecked });

  await boats.locator('input[type="checkbox"]').first().setChecked(wasChecked);
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("บันทึกการแก้ไขลวดลายแล้ว");
  await reopen(page, "patterns", "ลายเกล็ดพญานาค");
  await expect(boats.locator('input[type="checkbox"]').first()).toBeChecked({ checked: wasChecked });
});

test("an oversized camera photograph is shrunk in the browser and still uploads", async ({ page }) => {
  // The real failure this guards: a serverless host refuses a request body of a few
  // megabytes, and a photograph straight off a camera is bigger than that. The browser has
  // to shrink it before it is sent, or every real upload fails with a platform error.
  //
  // The file is generated here rather than committed, so the repository does not carry a
  // six-megabyte fixture whose only job is to be too big. Noise, because a flat image
  // compresses to almost nothing and would not be oversized.
  const pixels = Buffer.alloc(5200 * 3900 * 3);
  for (let i = 0; i < pixels.length; i += 1) pixels[i] = (Math.random() * 256) | 0;
  const oversized = path.join(os.tmpdir(), `ruaphra-oversized-${Date.now()}.jpg`);
  await sharp(pixels, { raw: { width: 5200, height: 3900, channels: 3 } })
    .jpeg({ quality: 95 })
    .toFile(oversized);
  const { size } = await stat(oversized);
  expect(size, "the generated photograph should exceed the request body limit").toBeGreaterThan(4 * 1024 * 1024);

  try {
    await login(page);
    await page.goto("/admin/media/new");
    await page.setInputFiles('input[accept^="image"]', oversized);

    await expect(page.locator(".admin-upload .admin-media-preview")).toBeVisible({ timeout: 60_000 });
    await expect(page.locator(".admin-upload .field-error")).toHaveCount(0);

    const alt = `ภาพทดสอบการอัปโหลด ใหญ่ ${Date.now()}`;
    await page.getByLabel("คำบรรยายภาพ").fill(alt);
    await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
    await expect(page.locator(".admin-feedback")).toContainText("เพิ่มไฟล์สื่อแล้ว");
    await reopen(page, "media", alt);

    // Stored at the archive's own ceiling, not at whatever came out of the camera. Read
    // from the served file rather than the form, because width is recorded by the upload
    // and never shown as a field.
    const preview = page.locator(".admin-upload .admin-media-preview img");
    await expect(preview).toBeVisible();
    await expect
      .poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    const stored = await preview.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(stored, "the stored photograph should be capped at the archive's own width").toBeLessThanOrEqual(2400);
  } finally {
    await rm(oversized, { force: true });
  }
});

test("the video control appears and explains itself when storage is not configured", async ({ page }) => {
  await login(page);
  await page.goto("/admin/media/new");

  // Video goes browser-to-bucket, so without a bucket there is nowhere for it to go. The
  // form has to say that rather than failing once someone has waited out a 30MB upload.
  const field = page.locator(".admin-upload").filter({ hasText: "ไฟล์วิดีโอ" });
  await expect(field).toBeVisible();
  await expect(field.locator('input[accept^="video"]')).toHaveAttribute("accept", /video\/mp4/);

  // A file the browser cannot decode must produce something an editor can act on, not the
  // internal name of the step that failed.
  const tiny = Buffer.from([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50]);
  await field.locator('input[accept^="video"]').setInputFiles({ name: "clip.mp4", mimeType: "video/mp4", buffer: tiny });
  await expect(field.locator(".field-error")).toContainText("เปิดไฟล์วิดีโอนี้ไม่ได้", { timeout: 20_000 });
});
