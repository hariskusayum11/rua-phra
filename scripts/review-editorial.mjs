import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

// Read-only checks against the local database-backed site; no fixture cleanup.
const origin = "http://127.0.0.1:3100";
const output = "artifacts/editorial-review";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
try {
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(origin, { waitUntil: "networkidle" });
    const boat = await page.locator('a[href^="/boats/"]').first().getAttribute("href");
    const step = await page.locator('a[href^="/craft/"]').first().getAttribute("href");
    const routes = [...new Set(["/", "/craft", boat, step].filter(Boolean))];
    for (const route of routes) {
      const response = await page.goto(origin + route, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      const body = await page.locator("main").innerText();
      assert.ok(!body.includes("ดินสอร่างแบบ"), "Demo tool leaked into public content");
      assert.ok(!body.includes("วัสดุยึดติดสำหรับทดลอง"), "Demo material leaked");
      if (route === "/") {
        assert.equal(await page.locator(".home-pillars").count(), 0);
        assert.equal(await page.locator(".home-next-wall").count(), 0);
        assert.ok(body.includes("บทเรียนสาธิต"));
        assert.equal(await page.locator('.home-hero-actions a').first().getAttribute('href'), '#reader');
      }
      if (route.startsWith("/craft/")) {
        assert.ok(body.includes("รายการอยู่ระหว่างตรวจสอบ"));
        assert.equal(await page.locator('.step-gallery img[src*="placeholder"]').count(), 0);
      }
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        height: document.body.scrollHeight,
        readerTop: document.querySelector("#reader")?.getBoundingClientRect().top,
      }));
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      results.push({ width, route, ...metrics, errors: [...errors], violations: violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })) });
      assert.equal(metrics.overflow, false);
      assert.deepEqual(errors, []);
      assert.equal(violations.length, 0, JSON.stringify(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
      if (width === 390 || width === 1440) {
        const name = route === "/" ? "home" : route.replaceAll("/", "-");
        await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true });
        if (route === "/") {
          await page.locator("#introduction").scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/introduction-${width}.png` });
        }
      }
      console.log(JSON.stringify(results.at(-1)));
    }
    await context.close();
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
