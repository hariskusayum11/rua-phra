import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 390, 768, 1440]) {
  test(`Thai shell is accessible without overflow at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("เรือพระเล่าเรื่อง");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "ข้ามไปยังเนื้อหา" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
    expect(errors).toEqual([]);
    await page.screenshot({ path: `test-results/shell-${width}.png`, fullPage: true });
  });
}

test("404 provides a working return to the homepage", async ({ page }) => {
  const response = await page.goto("/missing");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ไม่พบหน้าที่ต้องการ");
  await page.getByRole("link", { name: "กลับหน้าหลัก" }).click();
  await expect(page).toHaveURL("/");
});

test("Thai content reflows at increased text size", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
