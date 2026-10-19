import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

// Read-only visual checks: no admin fixtures, database writes or media cleanup.
const origin = "http://127.0.0.1:3100";
const output = "artifacts/theme-review";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const routes = width === 390 || width === 1440 ? ["/", "/craft", "/learn", "/about", "/competition"] : ["/"];
    for (const route of routes) {
      const response = await page.goto(origin + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 850) {
        await page.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), y);
        await page.waitForTimeout(80);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(800);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        background: getComputedStyle(document.body).backgroundColor,
        font: getComputedStyle(document.body).fontFamily,
        fontSize: getComputedStyle(document.body).fontSize,
        headings: [...document.querySelectorAll("main h1,main h2")].slice(0,4).map(e => ({text:e.textContent,size:getComputedStyle(e).fontSize})),
      }));
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const record = { width, route, status: response.status(), ...metrics, violations: violations.map(v => ({ id:v.id, nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})) })) };
      results.push(record);
      console.log(JSON.stringify(record));
      const name = route === "/" ? "home" : route.slice(1);
      if(width === 390 || width === 1440) {
        await page.screenshot({ path:`${output}/${name}-${width}.png`, fullPage:true });
        if(route === "/") {
          await page.screenshot({ path:`${output}/hero-${width}.png` });
          await page.locator(".home-craft").scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await page.screenshot({ path:`${output}/craft-section-${width}.png` });
          await page.getByRole("button", {name:"เปิดเมนูทั้งหมด",exact:true}).click();
          await page.waitForTimeout(500);
          await page.screenshot({ path:`${output}/menu-${width}.png` });
          await page.getByRole("button", {name:"ปิดเมนู",exact:true}).click();
        }
      }
    }
    if(width === 320) {
      await page.goto(origin, {waitUntil:"networkidle"});
      await page.addStyleTag({content:"html {font-size:200%;}"});
      results.push({width,route:"/",zoom:"200%",overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
    }
    await context.close();
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results,null,2));
  await browser.close();
}
if(results.some(r=>r.overflow || (r.status && r.status!==200) || r.violations?.length))process.exitCode=1;
