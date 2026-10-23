import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [390, 768, 1440]) {
  test(`homepage previews stay short and accessible at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("main > section")).toHaveCount(8);
    const headings = await page.locator("main > section").evaluateAll(sections => sections.map(section => section.querySelector("h1,h2")?.textContent?.replace(/\s+/g, " ").trim()));
    expect(headings.slice(0, 5)).toEqual(["เรือพระเล่าเรื่อง", "เลือกมุมที่อยากรู้ แล้วออกไปสำรวจ", "จากกระดาษสู่เรือพระ", "เรือหนึ่งลำ หนึ่งเรื่องราว", "คลังลวดลาย"]);
    await expect(page.locator(".home-learning-card h2")).not.toBeEmpty();
    expect(headings.slice(6)).toEqual(["สีสันเรือพระ วิถีปากพะยูน", "ดูเรือพระให้ใกล้ขึ้น"]);
    await expect(page.locator(".explore-track > li")).toHaveCount(7);
    expect(await page.locator(".home-step-preview li").count()).toBeLessThanOrEqual(3);
    expect(await page.locator(".home-pattern-grid > li").count()).toBeLessThanOrEqual(4);
    await expect(page.locator(".home-reader-stage")).toHaveCount(1);
    await expect(page.locator(".home-learning-card")).toHaveCount(1);
    await expect(page.locator(".home-journey,.home-featured-strip,.home-process-track,.home-next-wall")).toHaveCount(0);
    await expect(page.locator(".explore-track")).not.toContainText("งานไม้แกะสลัก");
    await expect(page.locator(".explore-track a").nth(1)).toHaveAttribute("href", "/craft");
    await expect(page.locator(".home-learning-card")).toContainText("ข้อมูลสาธิต");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(axe.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("desktop hotspot opens a modal with focus and Escape returns to the opener", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const hotspot = page.locator(".home-hotspot").first();
  await hotspot.scrollIntoViewIfNeeded();
  await hotspot.focus();
  await page.keyboard.press("Enter");
  const panel = page.locator(".home-reader-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("button", { name: "ปิดรายละเอียด" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(hotspot).toBeFocused();
});

test("mobile parts have separate touch targets, trap focus and return to the chosen part", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const parts = page.locator(".home-hotspot");
  expect(await parts.count()).toBeGreaterThan(0);
  await expect(page.locator(".home-hotspot").first()).toBeVisible();
  const boxes = await parts.evaluateAll(buttons => buttons.map(button => { const box = button.getBoundingClientRect(); return { x: box.x, y: box.y, w: box.width, h: box.height }; }));
  for (let index = 0; index < boxes.length; index++) {
    expect(boxes[index].h).toBeGreaterThanOrEqual(24);
    expect(boxes[index].w).toBeGreaterThanOrEqual(24);
    for (const other of boxes.slice(index + 1)) {
      const box = boxes[index];
      expect(box.x < other.x + other.w && box.x + box.w > other.x && box.y < other.y + other.h && box.y + box.h > other.y).toBe(false);
    }
  }
  await parts.first().click();
  const panel = page.locator(".home-reader-panel");
  await expect(panel).toBeVisible();
  const rect = await panel.boundingBox();
  expect(rect?.width).toBe(390);
  expect(Math.round((rect?.y ?? 0) + (rect?.height ?? 0))).toBe(844);
  await panel.getByRole("link").last().focus();
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("button", { name: "ปิดรายละเอียด" })).toBeFocused();
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(axe.violations).toEqual([]);
  await panel.getByRole("button", { name: "ปิดรายละเอียด" }).click();
  await expect(parts.first()).toBeFocused();
});

test("mobile hero overlays its text within the photograph", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const image = await page.locator(".home-hero-media").boundingBox();
  const title = await page.locator(".home-hero-title").boundingBox();
  expect(image?.width).toBe(390);
  expect(title!.y).toBeGreaterThanOrEqual(image!.y);
  expect(title!.y + title!.height).toBeLessThanOrEqual(image!.y + image!.height);
});

test("image cards show archive photography on both the homepage and learning index", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const images = page.locator(".explore-track img, .home-learning-photo img");
  await expect(images).toHaveCount(8);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(await image.getAttribute("src")).not.toContain("placeholder");
  }
  await page.goto("/learn");
  await expect(page.locator(".learn-course-image img").first()).toBeVisible();
  await expect(page.locator(".learn-course-image").first()).toContainText("ภาพประกอบจากคลังงานช่าง");
  await expect(page.locator(".learn-course-list")).toContainText("ข้อมูลสาธิต");
});

test("the highlight links to all boats and each public homepage link resolves", async ({ page, request }) => {
  await page.goto("/");
  const allBoats = page.locator("#reader").getByRole("link", { name: /ดูเรือทั้งหมด/ });
  await expect(allBoats).toHaveAttribute("href", "/boats");
  const hrefs = await page.locator("main a[href]").evaluateAll(links => [...new Set(links.map(link => link.getAttribute("href") ?? ""))].filter(href => href.startsWith("/")));
  for (const href of hrefs) expect((await request.get(href)).status(), href).toBeLessThan(400);
  await allBoats.click();
  await expect(page).toHaveURL(/\/boats$/);
  await expect.poll(() => page.locator(".collection-grid > li").count()).toBeGreaterThan(1);
});

test("boat exhibit changes boats and resets its hotspot zoom", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".reader-thumbnails")).toHaveCount(0);
  const firstRoute = await page.locator(".home-reader-caption a").getAttribute("href");
  await page.locator(".reader-navigation button").last().click();
  await expect(page.locator(".reader-navigation > span")).toContainText("2 /");
  expect(await page.locator(".home-reader-caption a").getAttribute("href")).not.toBe(firstRoute);
  await page.locator(".home-hotspot").first().click();
  await expect(page.locator(".home-reader-stage")).toHaveAttribute("data-zoomed", "true");
  await expect.poll(() => page.locator(".reader-zoom-plane").evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a)).toBeCloseTo(1.85);
  await page.keyboard.press("Escape");
  await expect(page.locator(".home-reader-stage")).toHaveAttribute("data-zoomed", "false");
  await page.locator(".reader-navigation button").first().click();
  await expect(page.locator(".home-reader-caption a")).toHaveAttribute("href", firstRoute!);
});


test("tablet hero keeps its heading and primary action in the first screen", async ({ page }) => {
  await page.setViewportSize({ width: 997, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const action = await page.locator(".home-hero-actions .button-solid").boundingBox();
  expect(action!.y + action!.height).toBeLessThan(900);
  const copy = await page.locator(".home-hero-copy").boundingBox();
  expect(copy!.width).toBeLessThan(550);
  await expect(page.locator(".home-hero-title")).toBeVisible();
});

test("culture gallery advances in view and pauses after manual navigation", async ({ page }) => {
  await page.goto("/");
  const gallery = page.locator(".culture-gallery");
  await gallery.scrollIntoViewIfNeeded();
  const counter = gallery.locator(".culture-counter");
  await expect(counter).toContainText("01 /");
  await expect(counter).toContainText("02 /", { timeout: 10000 });
  await gallery.getByRole("button", { name: "ภาพถัดไป", exact: true }).click();
  await expect(counter).toContainText("03 /");
  await expect(gallery.locator(".culture-play")).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(7200);
  await expect(counter).toContainText("03 /");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(gallery.locator(".culture-play")).toHaveAttribute("aria-pressed", "false");
});


test("ebook shows descriptions and turns whole paper from top and bottom corners", async ({page})=>{
 for(const width of [390,1440]) {
 await page.setViewportSize({width,height:820}); await page.goto("/");
 const book=page.locator(".ebook-host"); await book.scrollIntoViewIfNeeded();
 await expect(book.locator(".ebook-description").first()).toBeVisible();
 const description=await book.locator(".ebook-description").first().boundingBox();
 const photo=await book.locator(".ebook-photo").first().boundingBox();
 expect(description!.y).toBeGreaterThanOrEqual(photo!.y+photo!.height);
 for(const position of [0.03,0.5,0.97]) {
 const bounds=await book.boundingBox();
 const y=bounds!.y+bounds!.height*position;
 await page.mouse.move(bounds!.x+bounds!.width*(position===0.5?.7:.97),y); await page.mouse.down();
 await page.mouse.move(bounds!.x+25,y,{steps:35}); await page.mouse.up();
 await expect(page.locator(".ebook-controls")).toContainText(width===390 ? "หน้า 2 /" : "3–4");
 await page.getByRole("button",{name:"ก่อนหน้า",exact:true}).click();
 await expect(page.locator(".ebook-controls")).toContainText(width===390 ? "หน้า 1 /" : "1–2");
 }
 await page.getByRole("button",{name:"ปิดหน้าปก",exact:true}).click();
 await expect(page.locator(".ebook-controls")).toContainText("หน้าปก");
 await page.getByRole("button",{name:"เปิดสมุด",exact:true}).click();
 await expect(page.locator(".ebook-controls")).toContainText(width===390 ? "หน้า 1 /" : "1–2");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 }
});
