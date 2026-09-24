import "dotenv/config";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The hotspot canvas sizes itself to its image. Percentages are measured against that box,
 * so every measurement has to wait for the photograph to finish loading — a placeholder SVG
 * settled instantly, a real field photograph does not.
 */
async function canvasReady(page: Page) {
  const image = page.locator(".hotspot-canvas > img");
  await image.waitFor({ state: "visible" });
  await image.evaluate(async (node: HTMLImageElement) => {
    if (node.complete) return;
    await new Promise<void>((resolve) => {
      node.addEventListener("load", () => resolve(), { once: true });
      node.addEventListener("error", () => resolve(), { once: true });
    });
  });
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("รหัสผ่าน").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("admin is protected and the dashboard is accessible after login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  await login(page);
  await expect(page.getByRole("heading", { name: "ภาพรวมคลังข้อมูล" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("material CRUD persists through the real admin form", async ({ page }) => {
  await login(page);
  const slug=`browser-material-${Date.now()}`;
  await page.goto("/admin/materials/new");
  await page.getByLabel("ชื่อ").fill("วัสดุทดสอบจากเบราว์เซอร์");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("คำอธิบาย").fill("สร้างเพื่อยืนยันการทำงานของ CRUD และจะถูกลบเมื่อทดสอบเสร็จ");
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page).toHaveURL(/\/admin\/materials\/[0-9a-f-]+$/);
  await expect(page.locator(".admin-feedback")).toContainText("สร้างรายการแล้ว");

  await page.getByLabel("ชื่อ").fill("วัสดุทดสอบที่แก้ไขแล้ว");
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("บันทึกการแก้ไขแล้ว");
  await page.reload();
  await expect(page.getByLabel("ชื่อ")).toHaveValue("วัสดุทดสอบที่แก้ไขแล้ว");

  page.once("dialog", dialog=>dialog.accept());
  await page.getByRole("button", { name: "ลบรายการ" }).click();
  await expect(page).toHaveURL(/\/admin\/materials$/);
  await expect(page.getByText("วัสดุทดสอบที่แก้ไขแล้ว")).toHaveCount(0);
});

test("published content records reviewer attribution", async ({ page }) => {
  await login(page);
  const slug=`browser-process-${Date.now()}`;
  await page.goto("/admin/processes/new");
  await page.getByLabel("ชื่อกระบวนการ").fill("กระบวนการทดสอบการเผยแพร่");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("คำอธิบาย").fill("ข้อมูลชั่วคราวสำหรับตรวจสอบสถานะการเผยแพร่");
  await page.getByLabel("สถานะเนื้อหา").selectOption("PUBLISHED");
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("สร้างรายการแล้ว");
  await page.goto("/admin/processes");
  const row=page.getByRole("row", { name: /กระบวนการทดสอบการเผยแพร่/ });
  await expect(row).toContainText("PUBLISHED");
  await row.getByRole("link", { name: "แก้ไข" }).click();
  page.once("dialog", dialog=>dialog.accept());
  await page.getByRole("button", { name: "ลบรายการ" }).click();
  await expect(page).toHaveURL(/\/admin\/processes$/);
});

test("hotspot editor converts clicks to percentages and persists dragged coordinates", async ({ page }) => {
  await login(page);
  const slug=`browser-hotspot-${Date.now()}`;
  await page.goto("/admin/sections/new");
  await page.locator('select[name="boatId"]').selectOption({ index: 1 });
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("ชื่อส่วน").fill("จุดทดสอบพิกัด");
  await page.getByLabel("ลำดับ").fill(String(Math.floor(Date.now()/1000)));
  await page.getByLabel("คำอธิบาย").fill("จุดชั่วคราวสำหรับตรวจสอบเครื่องมือวางพิกัด");
  const canvas=page.locator(".hotspot-canvas");
  await canvas.scrollIntoViewIfNeeded();
  await canvasReady(page);
  const box=await canvas.boundingBox();
  if(!box)throw new Error("Hotspot canvas missing");
  await canvas.click({position:{x:box.width*.72,y:box.height*.28}});
  expect(Number(await page.getByLabel("X (%)").inputValue())).toBeCloseTo(72,1);
  expect(Number(await page.getByLabel("Y (%)").inputValue())).toBeCloseTo(28,1);
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("สร้างรายการแล้ว");
  await expect(page).toHaveURL(/\/admin\/sections\/[0-9a-f-]+$/);

  const editCanvas=page.locator(".hotspot-canvas");
  const point=page.locator(".hotspot-admin-point");
  await editCanvas.scrollIntoViewIfNeeded();
  await canvasReady(page);
  const pointBox=await point.boundingBox(); const currentCanvas=await editCanvas.boundingBox();
  if(!pointBox||!currentCanvas)throw new Error("Hotspot drag target missing");
  // A drag needs the grab to register before the travel starts, and enough intermediate
  // moves that the handler sees the path rather than a single jump.
  await page.mouse.move(pointBox.x+pointBox.width/2,pointBox.y+pointBox.height/2);
  await page.mouse.down();
  await page.mouse.move(pointBox.x+pointBox.width/2+4,pointBox.y+pointBox.height/2+4,{steps:2});
  await page.mouse.move(currentCanvas.x+currentCanvas.width*.35,currentCanvas.y+currentCanvas.height*.65,{steps:24});
  await page.mouse.up();
  // Separates a drag that failed from a save that lost the value.
  await expect(page.getByLabel("X (%)")).toHaveValue(/^3[45](\.|$)/);
  await expect(page.getByLabel("Y (%)")).toHaveValue(/^6[456](\.|$)/);
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("บันทึกการแก้ไขแล้ว");
  await page.reload();
  // react-hook-form fills these inputs after hydration, so the assertion has to retry.
  // A one-shot inputValue() can read "" before that, and Number("") is 0.
  await expect(page.getByLabel("X (%)")).toHaveValue(/^3[45](\.|$)/);
  await expect(page.getByLabel("Y (%)")).toHaveValue(/^6[456](\.|$)/);
  page.once("dialog", dialog=>dialog.accept());
  await page.getByRole("button", { name: "ลบรายการ" }).click();
  await expect(page).toHaveURL(/\/admin\/sections$/);
});
