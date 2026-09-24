import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const boatUrl = "/boats/wat-don-pradu-2569-demo";

test("hotspots come from the database and preserve percentage coordinates", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(boatUrl);
  await expect(page.locator(".boat-image")).toBeVisible();
  await expect(page.locator(".boat-stage")).toHaveAttribute("data-loaded", "true");

  const hotspots = page.getByRole("button", { name: /จุดที่/ });
  await expect(hotspots).toHaveCount(5);
  await expect(hotspots.nth(0)).toHaveAttribute("style", /left:\s*50%;\s*top:\s*15%/);
  await expect(hotspots.nth(2)).toHaveAttribute("style", /left:\s*20%;\s*top:\s*70%/);
});

test("keyboard opens the desktop side panel, traps focus, and restores it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(boatUrl);
  const hotspot = page.getByRole("button", { name: "จุดที่ 1: ยอดเรือ" });
  await hotspot.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "ยอดเรือ" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /ลายกระหนกใบเทศ/ })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /ช่างสมชาย บุญช่วย/ })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /ออกแบบลวดลาย/ })).toBeVisible();
  await expect(hotspot).toHaveAttribute("aria-expanded", "true");
  expect((await dialog.boundingBox())?.width).toBeLessThan(520);

  const accessibility = await new AxeBuilder({ page }).include(".exhibit-panel").analyze();
  expect(accessibility.violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(hotspot).toBeFocused();
});

test("mobile opens a touch-friendly bottom sheet without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(boatUrl);
  await page.getByRole("button", { name: "จุดที่ 2: บุษบกกลางเรือ" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(250); // Let the 200 ms entrance motion settle before measuring.
  const box = await dialog.boundingBox();
  expect(box?.width).toBeCloseTo(390, 2);
  expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const hotspots = page.getByRole("button", { name: /จุดที่/ });
  const targetSize = await hotspots.nth(0).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(targetSize.width).toBeGreaterThanOrEqual(44);
  expect(targetSize.height).toBeGreaterThanOrEqual(44);
});
