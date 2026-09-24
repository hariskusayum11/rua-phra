import { expect, test } from "@playwright/test";

/**
 * Walks the public site and asserts nothing links into a 404.
 *
 * This exists because the boat and craft pages linked to artisan and pattern pages that
 * had never been built — five dead links a visitor could reach in two clicks, invisible to
 * every other test. Crawling one level into the detail pages keeps their own links honest
 * as the archive grows.
 */
test("no public page links into a 404", async ({ page, request }) => {
  const pages = ["/", "/craft", "/boats/rua-phra-wat-rattanaram-2568", "/boats/rua-phra-wat-rattanaram-2567", "/craft/paper-cutting-demo"];
  const seen = new Map<string, string[]>();
  const queue = [...pages];
  const visited = new Set<string>();
  while (queue.length) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    const hotspot = page.locator(".home-hotspot, .hotspot").first();
    if (await hotspot.count()) { await hotspot.click().catch(() => {}); await page.waitForTimeout(400); }
    const hrefs = await page.locator("a[href]").evaluateAll((nodes) =>
      [...new Set(nodes.map((n) => n.getAttribute("href") ?? ""))].filter((h) => h.startsWith("/") && !h.startsWith("/#")));
    for (const href of hrefs) {
      if (!seen.has(href)) seen.set(href, []);
      seen.get(href)!.push(url);
      // Follow one level into the new detail pages so their own links get checked too.
      if ((href.startsWith("/patterns/") || href.startsWith("/masters/")) && !visited.has(href)) queue.push(href);
    }
  }
  const broken: string[] = [];
  for (const [href, from] of seen) {
    const res = await request.get(href, { maxRedirects: 0 });
    if (res.status() >= 400) broken.push(`${res.status()}  ${href}   ← ${[...new Set(from)].join(", ")}`);
  }
  // A crawl that found nothing would pass silently, which is the one way this test can lie.
  expect(seen.size, "the crawl found no links, so it is not testing anything").toBeGreaterThan(10);
  expect(broken, `dead links found:\n${broken.join("\n")}`).toEqual([]);
});
