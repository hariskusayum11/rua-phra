import "dotenv/config";
import { expect, test } from "@playwright/test";

/**
 * Every page, public and admin, must offer the level above it.
 *
 * Written as one sweep rather than a case per page because the failure it guards against
 * is a page being added without one — and a test that lists pages by hand will not know
 * about the page nobody remembered to list.
 *
 * It matters most for someone who scanned a QR code at the temple: their history is empty,
 * so the browser's back button does nothing and the page they landed on is the whole site
 * as far as they can tell.
 */
test("no page in the site or the admin is a dead end", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("รหัสผ่าน").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const resources = ["media","temples","boats","stories","sections","patterns","masters","processes","steps","materials","tools","techniques","sources","courses","lessons","qr-codes"];
  const paths = [
    "/", "/craft", "/craft/paper-cutting-demo", "/boats/rua-phra-wat-rattanaram-2568",
    "/patterns/lai-dok-bon-thaeb-kradat", "/masters/chang-lai-kradat-rattanaram",
    "/learn", "/learn/paper-craft-path-demo", "/learn/paper-craft-path-demo/lesson-1-demo",
    "/exhibition", "/about", "/login",
    "/admin", "/admin/storage", "/admin/qr-print",
    ...resources.map(r => `/admin/${r}`),
    ...resources.map(r => `/admin/${r}/new`),
  ];

  const bad: string[] = [];
  for (const p of paths) {
    const res = await page.goto(p, { waitUntil: "domcontentloaded" });
    if ((res?.status() ?? 0) >= 400) { bad.push(`${p} → ${res?.status()}`); continue; }
    const links = await page.locator("a[href]").evaluateAll(ns =>
      ns.map(n => n.getAttribute("href") ?? "").filter(h => h.startsWith("/") && h !== "#"));
    const inAdmin = p.startsWith("/admin");
    // An admin page must offer the level above it, not merely the sidebar's flat list.
    const up = inAdmin
      ? links.some(h => h === "/admin" || /^\/admin\/[a-z-]+$/.test(h))
      : links.some(h => h === "/" || h.startsWith("/#"));
    if (!links.length || !up) bad.push(`${p}  ลิงก์ ${links.length}  ขึ้นระดับบน ${up}`);
  }
  console.log(bad.length ? "ยังไม่มีทางออก:\n  " + bad.join("\n  ") : "ทุกหน้ามีทางออกครบ");
  expect(bad, "หน้าที่ยังเป็นทางตัน").toEqual([]);
});
