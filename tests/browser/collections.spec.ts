import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The collection pages — the level between the homepage and a single record.
 *
 * What matters most is that every record is reachable from the site itself. Before these
 * pages, pattern and artisan entries had no inbound link at all: the only way to one was
 * its QR code.
 */
const pages = [
  { path: "/boats", label: "เรื่องเล่าเรือพระ", detail: /^\/boats\/[^/]+$/ },
  { path: "/patterns", label: "คลังลวดลาย", detail: /^\/patterns\/[^/]+$/ },
  { path: "/masters", label: "ช่างผู้สืบสาน", detail: /^\/masters\/[^/]+$/ },
];

for (const { path, label, detail } of pages) {
  test(`${path} names itself after its menu item and links to every record it lists`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
    const trail = page.getByRole("navigation", { name: "ตำแหน่งในเว็บไซต์" });
    await expect(trail.getByRole("link", { name: "หน้าแรก" })).toHaveAttribute("href", "/");
    await expect(trail.locator('[aria-current="page"]')).toHaveText(label);

    const cards = page.locator(".collection-grid > li a");
    const count = await cards.count();
    expect(count, "the collection should list at least one record").toBeGreaterThan(0);
    for (const href of await cards.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href") ?? ""))) {
      expect(href).toMatch(detail);
    }
    // Follow the first one through: the record it names has to exist.
    const first = await cards.first().getAttribute("href");
    const response = await page.goto(first!);
    expect(response?.status()).toBe(200);
  });
}

test("the works page says plainly that nothing is published yet, and shows no fixtures", async ({ page }) => {
  await page.goto("/works");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ผลงานคนรุ่นใหม่");
  await expect(page.getByRole("heading", { name: "ยังไม่มีผลงานที่เผยแพร่" })).toBeVisible();
  // The four fixture pieces in the database must not be shown as learners' work.
  await expect(page.getByText(/ผู้เรียน [กขคง]|ข้อมูลสาธิต/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /ไปที่บทเรียน/ })).toHaveAttribute("href", "/learn");
});

for (const width of [390, 1440]) {
  test(`collection pages are accessible without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/boats", "/patterns", "/masters", "/works"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations, path).toEqual([]);
    }
  });
}

test("the menu has a way home and marks the page you are on, detail pages included", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const bar = page.getByRole("navigation", { name: "เมนูหลัก" });
  for (const [path, current] of [
    ["/", "หน้าแรก"],
    ["/boats", "เรื่องเล่าเรือพระ"],
    ["/boats/rua-phra-wat-rattanaram-2568", "เรื่องเล่าเรือพระ"],
    ["/craft/paper-cutting-demo", "จากกระดาษสู่เรือพระ"],
    ["/patterns", "คลังลวดลาย"],
    ["/learn", "เรียนรู้"],
    ["/competition", "ผลการประกวด"],
  ] as const) {
    await page.goto(path);
    await expect(bar.getByRole("link", { name: "หน้าแรก" })).toHaveAttribute("href", "/");
    // Exactly one item is current, and it is the one this page belongs to.
    await expect(bar.locator('a[aria-current="page"]'), path).toHaveCount(1);
    await expect(bar.locator('a[aria-current="page"]'), path).toHaveText(current);
  }
});

test("every page a menu item opens says the menu item's name", async ({ page }) => {
  for (const [path, label] of [
    ["/craft", "จากกระดาษสู่เรือพระ"], ["/learn", "เรียนรู้"], ["/competition", "ผลการประกวด"],
    ["/about", "เกี่ยวกับโครงการ"], ["/masters", "ช่างผู้สืบสาน"], ["/works", "ผลงานคนรุ่นใหม่"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "ตำแหน่งในเว็บไซต์" }).locator('[aria-current="page"]'), path).toHaveText(label);
  }
});

test("menu labels stay on one line wherever the bar is shown", async ({ page }) => {
  for (const width of [1120, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/boats");
    const heights = await page.locator(".header-nav a").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
    expect(Math.max(...heights), `${width}px`).toBeLessThanOrEqual(48);
  }
});
