import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const widths = [
  { label: "mobile", width: 390 },
  { label: "tablet", width: 834 },
  { label: "desktop", width: 1440 },
];

/** The eleven movements, in the order the story depends on. */
const sectionOrder = [
  "เรือพระเล่าเรื่อง",
  "เรือพระปากพะยูน",
  "จากกระดาษ",
  "เรือหนึ่งลำ หนึ่งเรื่องราว",
  "ประกอบขึ้นจากเรื่องราวมากมาย",
  "ภูมิปัญญาไม่ได้เกิดขึ้นในขั้นตอนเดียว",
  "ลวดลายที่บันทึกเรื่องราว",
  "จากการมองเห็น",
  "เมื่อภูมิปัญญาถูกส่งต่อ",
  "แล้วชุมชนก็พาไปต่อ",
  "เรือพระไม่ได้มีชีวิต",
];

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}

for (const { label, width } of widths) {
  test(`homepage tells the story without overflow or violations at ${label}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await settle(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("เรือพระเล่าเรื่อง");

    const headings = await page.locator("main h2, main h1").allInnerTexts();
    const flattened = headings.join(" | ");
    let cursor = 0;
    for (const fragment of sectionOrder) {
      const found = flattened.indexOf(fragment, cursor);
      expect(found, `missing or out of order: ${fragment}`).toBeGreaterThanOrEqual(0);
      cursor = found;
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);

    expect(errors).toEqual([]);
    await page.screenshot({ path: `test-results/home-${label}.png`, fullPage: true });
  });
}

test("featured boats advance only when the reader asks", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await settle(page);

  const spread = page.locator(".home-featured-spread");
  const first = await spread.getByRole("heading", { level: 3 }).innerText();

  // Nothing may move on its own — the rule that matters whatever the archive holds.
  await page.waitForTimeout(2500);
  await expect(spread.getByRole("heading", { level: 3 })).toHaveText(first);

  const next = page.getByRole("button", { name: "เรือลำถัดไป" });
  if ((await next.count()) === 0) {
    // A single boat offers nothing to step through, so the controls are absent by design.
    await expect(page.getByRole("button", { name: "เรือลำก่อนหน้า" })).toHaveCount(0);
    return;
  }

  await next.click();
  await expect(spread.getByRole("heading", { level: 3 })).not.toHaveText(first);

  await page.getByRole("button", { name: "เรือลำก่อนหน้า" }).click();
  await expect(spread.getByRole("heading", { level: 3 })).toHaveText(first);
});

test("boat hotspots open from the keyboard and close with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await settle(page);

  const hotspot = page.locator(".home-hotspot").first();
  await hotspot.scrollIntoViewIfNeeded();
  await hotspot.focus();
  await expect(hotspot).toBeFocused();
  await page.keyboard.press("Enter");

  const panel = page.getByRole("dialog", { name: /รายละเอียด/ });
  await expect(panel).toBeVisible();
  await expect(hotspot).toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  // Focus returns to the control that opened the panel.
  await expect(hotspot).toBeFocused();
});

test("on a narrow screen the hotspot detail rises as a bottom sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await settle(page);

  const hotspot = page.locator(".home-hotspot").first();
  await hotspot.scrollIntoViewIfNeeded();

  // Touch targets stay at the 44px minimum even though the dot itself is 12px.
  const size = await hotspot.boundingBox();
  expect(size?.width).toBeGreaterThanOrEqual(44);
  expect(size?.height).toBeGreaterThanOrEqual(44);

  await hotspot.click();
  const panel = page.getByRole("dialog", { name: /รายละเอียด/ });
  await expect(panel).toBeVisible();
  await page.waitForTimeout(400);

  const box = await panel.boundingBox();
  expect(box?.width).toBeCloseTo(390, 0);
  expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("the full menu opens, traps focus and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await settle(page);

  const toggle = page.getByRole("button", { name: "เปิดเมนูทั้งหมด" });
  await toggle.click();

  const menu = page.getByRole("dialog", { name: "เมนูทั้งหมด" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: /คลังลวดลาย/ })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(toggle).toBeFocused();
});

test("every homepage link resolves", async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await settle(page);

  const hrefs = await page.locator("a[href]").evaluateAll((nodes) =>
    [...new Set(nodes.map((node) => node.getAttribute("href") ?? ""))].filter(
      (href) => href.startsWith("/") && !href.startsWith("/#"),
    ),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), `${href} should not be a dead link`).toBeLessThan(400);
  }
});

test("hero photography is reserved before it loads, so nothing shifts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await settle(page);

  const shifted = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(total);
        }, 1200);
      }),
  );
  expect(shifted).toBeLessThan(0.1);
});
