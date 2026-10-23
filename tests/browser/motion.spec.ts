import { expect, test } from "@playwright/test";

test("reduced motion keeps images and text still through the page", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  for (const fraction of [0, .5, 1]) {
    await page.evaluate(value => scrollTo(0, (document.body.scrollHeight - innerHeight) * value), fraction);
    const moving = await page.locator("main img,main h1,main h2").evaluateAll(nodes => nodes.filter(node => getComputedStyle(node).transform !== "none" || Number(getComputedStyle(node).opacity) < 1).length);
    expect(moving).toBe(0);
  }
  await context.close();
});

test("photographs reserve space while images load", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => new Promise<number>(resolve => {
    let total = 0;
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) total += entry.value;
    });
    observer.observe({ type: "layout-shift", buffered: true });
    setTimeout(() => { observer.disconnect(); resolve(total); }, 700);
  }));
  expect(total).toBeLessThan(.1);
});

test("scrolling the homepage never creates horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (let step = 0; step <= 8; step++) {
    await page.evaluate(fraction => scrollTo(0, (document.body.scrollHeight - innerHeight) * fraction), step / 8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});
