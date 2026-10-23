import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

// Public, read-only inspection. It never seeds, cleans fixtures, or changes storage.
const origin = process.env.REVIEW_URL ?? "http://127.0.0.1:3100";
const output = process.env.REVIEW_OUTPUT ?? "artifacts/home-restructure";
const screenshotsOnly = process.argv.includes("--screenshots-only");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
try {
  for (const width of screenshotsOnly ? [390, 1440] : [320, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const routes = !screenshotsOnly && (width === 390 || width === 768 || width === 1440) ? ["/", "/boats", "/patterns", "/craft", "/learn", "/about", "/masters", "/works", "/competition"] : ["/"];
    for (const route of routes) {
      const errors = [];
      const listener = error => errors.push(error.message);
      page.on("pageerror", listener);
      const response = await page.goto(origin + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 850) {
        await page.evaluate(value => scrollTo({ top: value, behavior: "instant" }), y);
        await page.waitForTimeout(70);
      }
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(150);
      const metrics = await page.evaluate(() => ({
        height: document.body.scrollHeight,
        overflow: document.documentElement.scrollWidth > innerWidth,
        brokenImages: [...document.images].filter(image => image.complete && !image.naturalWidth && image.currentSrc).map(image => image.currentSrc),
        headings: [...document.querySelectorAll("main > section h2")].map(node => node.textContent),
      }));
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      results.push({ width, route, status: response.status(), ...metrics, errors, violations: violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) });
      console.log(JSON.stringify(results.at(-1)));
      if (route !== "/" && [390, 1440].includes(width)) {
        await page.screenshot({ path: `${output}/${route.slice(1)}-${width}.png`, fullPage: true });
      }
      if (route === "/" && [390, 1440].includes(width)) {
        await page.screenshot({ path: `${output}/after-${width}.png`, fullPage: true });
        for (const selector of [".home-hero", ".home-axes", ".home-reader", ".home-patterns"]) {
          await page.locator(selector).screenshot({ path: `${output}/${selector.slice(1)}-${width}.png` });
        }
      }
      page.off("pageerror", listener);
    }
    await context.close();
  }
} finally {
  await writeFile(`${output}/${screenshotsOnly ? "screenshots-results" : "results"}.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
if (results.some(result => result.status !== 200 || result.overflow || result.brokenImages.length || result.errors.length || result.violations.length)) process.exitCode = 1;
