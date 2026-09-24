import { expect, test } from "@playwright/test";

/**
 * The motion layer.
 *
 * Decoration is exactly the kind of thing that quietly breaks the two promises this page
 * makes to everyone: that it does not shift while you read it, and that it holds still for
 * anyone who asked it to. Both are asserted here rather than trusted to a CSS media query
 * nobody exercises.
 */

test("a photograph tips toward the pointer and settles back", async ({ page }) => {
  await page.goto("/");
  const tilt = page.locator(".home-featured-tilt");
  await tilt.scrollIntoViewIfNeeded();
  const box = await tilt.boundingBox();
  expect(box).not.toBeNull();

  // Off centre, so both axes should respond.
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.75);
  await expect(tilt).toHaveAttribute("data-tilting", "true");
  // The frame eases into the new angle, so the computed transform is still identity for
  // the first frames. Poll rather than reading once at the start of the transition.
  await expect
    .poll(() => tilt.locator(".media-frame").evaluate((node) => getComputedStyle(node).transform),
      { message: "the frame should be rotated in 3D" })
    .toMatch(/^matrix3d\(/);

  await page.mouse.move(box!.x + box!.width / 2, box!.y - 200);
  await expect(tilt).toHaveAttribute("data-tilting", "false");
});

test("reduced motion leaves every photograph square on", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");

  const tilt = page.locator(".home-featured-tilt");
  await tilt.scrollIntoViewIfNeeded();
  const box = await tilt.boundingBox();
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.75);

  // The component still records that the pointer is over it; the CSS is what refuses.
  const transform = await tilt.locator(".media-frame").evaluate((node) => getComputedStyle(node).transform);
  expect(transform, "a reader who asked for stillness got a rotation").toBe("none");

  // Scroll-driven depth is off too, so nothing is mid-animation at an arbitrary opacity.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  const faded = await page.locator(".depth, .push, .layer").evaluateAll((nodes) =>
    nodes.filter((node) => Number(getComputedStyle(node).opacity) < 0.99).length);
  expect(faded, "a depth layer was left part-way faded under reduced motion").toBe(0);

  await context.close();
});

test("nothing that moves widens the page", async ({ page }) => {
  // The procession band travels sideways and several frames scale up; all of it has to
  // stay inside the document or a phone gets a horizontal scrollbar halfway down the page.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const steps = 12;
  for (let step = 0; step <= steps; step += 1) {
    await page.evaluate((fraction) => {
      window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * fraction);
    }, step / steps);
    await page.waitForTimeout(120);
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow at ${Math.round((step / steps) * 100)}% down the page`).toBeLessThanOrEqual(1);
  }
});
