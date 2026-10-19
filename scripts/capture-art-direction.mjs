import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const url = pathToFileURL(resolve("docs/art-direction-preview.html")).href;
const output = "artifacts/art-direction-preview";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      images: [...document.images].map(img => ({ loaded: img.complete && img.naturalWidth > 0, src: img.currentSrc })),
    }));
    if (result.overflow || result.images.some(img => !img.loaded)) throw new Error(JSON.stringify({ width, ...result }));
    await page.screenshot({ path: `${output}/preview-${width}.png`, fullPage: true });
    console.log(JSON.stringify({ width, overflow: result.overflow, imagesLoaded: result.images.length }));
    await page.close();
  }
} finally {
  await browser.close();
}
