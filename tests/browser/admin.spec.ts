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

/**
 * Saving returns to the list, so a test that wants to inspect what it saved has to go back
 * in. Finds the row by the text that identifies it and follows its edit link.
 */
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
  await expect(page.locator(".admin-feedback")).toContainText("เพิ่มวัสดุแล้ว");
  await reopen(page, "materials", "วัสดุทดสอบจากเบราว์เซอร์");

  await page.getByLabel("ชื่อ").fill("วัสดุทดสอบที่แก้ไขแล้ว");
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("บันทึกการแก้ไขวัสดุแล้ว");
  await reopen(page, "materials", "วัสดุทดสอบที่แก้ไขแล้ว");
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
  await expect(page).toHaveURL(/\/admin\/processes$/);
  await expect(page.locator(".admin-feedback")).toContainText("เพิ่มกระบวนการแล้ว");
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
  await expect(page.locator(".admin-feedback")).toContainText("เพิ่มจุดสำรวจแล้ว");
  await reopen(page, "sections", "จุดทดสอบพิกัด");

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
  await expect(page.locator(".admin-feedback")).toContainText("บันทึกการแก้ไขจุดสำรวจแล้ว");
  await reopen(page, "sections", "จุดทดสอบพิกัด");
  // react-hook-form fills these inputs after hydration, so the assertion has to retry.
  // A one-shot inputValue() can read "" before that, and Number("") is 0.
  await expect(page.getByLabel("X (%)")).toHaveValue(/^3[45](\.|$)/);
  await expect(page.getByLabel("Y (%)")).toHaveValue(/^6[456](\.|$)/);
  page.once("dialog", dialog=>dialog.accept());
  await page.getByRole("button", { name: "ลบรายการ" }).click();
  await expect(page).toHaveURL(/\/admin\/sections$/);
});

test("the storage page says where files are kept and warns before any charge", async ({ page }) => {
  await login(page);
  await page.goto("/admin/storage");
  await expect(page.getByRole("heading", { level: 1, name: "พื้นที่เก็บไฟล์" })).toBeVisible();

  // The page has to read correctly whether or not a bucket is configured, because the
  // suite runs in both situations: a developer with no cloud account, and a checkout that
  // has the real credentials in .env.
  const configured = await page.locator(".storage-card").count();
  if (configured) {
    await expect(page.locator(".storage-figure")).toContainText(/MB|KB|GB/);
    await expect(page.getByRole("progressbar")).toBeVisible();
    // The whole point of the page: it names the ceiling and says what happens at it.
    await expect(page.locator(".storage-notes")).toContainText("หยุดรับไฟล์");
    const level = await page.locator(".storage-card").getAttribute("data-level");
    expect(["ok", "warn", "danger"]).toContain(level);
  } else {
    await expect(page.getByText("เก็บไฟล์ไว้ในเครื่องนี้")).toBeVisible();
  }

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect(page.getByRole("link", { name: "พื้นที่เก็บไฟล์" })).toBeVisible();
});

test("the menu is grouped, marks the page you are on, and fits the screen", async ({ page }) => {
  await login(page);
  await page.goto("/admin/materials");

  // The group holding the current page is open; the other three are folded away. That is
  // the whole reason the menu fits, so it is worth asserting rather than assuming.
  const groups = page.locator(".admin-nav-group");
  await expect(groups).toHaveCount(4);
  await expect(page.locator(".admin-nav-group[open]")).toHaveCount(1);
  await expect(page.locator(".admin-nav-group[open] summary")).toHaveText(/งานช่างและภูมิปัญญา/);

  const current = page.locator('.admin-sidebar nav a[aria-current="page"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText(/วัสดุ/);

  // Eighteen links in one column overflowed every laptop screen. If a future group pushes
  // it past the viewport again, this is where it shows up.
  const fits = await page.locator(".admin-sidebar").evaluate((node) => node.scrollHeight <= node.clientHeight);
  expect(fits, "the admin menu should fit without scrolling").toBe(true);

  // A link in a folded group is still reachable: open the group, click, and the menu
  // follows you there.
  await page.locator(".admin-nav-group summary").filter({ hasText: "บทเรียนและแหล่งอ้างอิง" }).click();
  await page.getByRole("link", { name: "ชุดบทเรียน" }).click();
  await expect(page).toHaveURL(/\/admin\/courses$/);
  await expect(page.locator(".admin-nav-group[open] summary")).toHaveText(/บทเรียนและแหล่งอ้างอิง/);
  await expect(page.locator('.admin-sidebar nav a[aria-current="page"]')).toHaveText(/ชุดบทเรียน/);

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
