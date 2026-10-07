import "dotenv/config";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The competition archive.
 *
 * The thing worth protecting is the arithmetic. A reader takes "วัดรัตนาราม ได้ที่ 1 สี่ครั้ง"
 * as a fact about the district, not as a number a page happened to print, so the summary is
 * checked against the year list it claims to summarise rather than against figures written
 * into this file — which would only prove the page still says what it said.
 */

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("รหัสผ่าน").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

const TEST_YEAR = "2699";

test("the summary table agrees with the year-by-year list", async ({ page }) => {
  await page.goto("/competition");

  // Count the placings straight off the rendered years.
  const counted = await page.locator(".competition-year").evaluateAll((years) => {
    const tally: Record<string, Record<number, number>> = {};
    for (const year of years) {
      for (const place of year.querySelectorAll<HTMLElement>(".competition-places li")) {
        const rank = Number(place.dataset.rank);
        const temple = place.querySelector(".competition-temple")?.childNodes[0]?.textContent?.trim() ?? "";
        tally[temple] ??= {};
        tally[temple][rank] = (tally[temple][rank] ?? 0) + 1;
      }
    }
    return tally;
  });
  expect(Object.keys(counted).length, "the year list should name some temples").toBeGreaterThan(0);

  const printed = await page.locator(".competition-table tbody tr").evaluateAll((rows) =>
    rows.map((row) => ({
      temple: row.querySelector("th")?.childNodes[0]?.textContent?.trim() ?? "",
      cells: [...row.querySelectorAll("td")].map((cell) => cell.textContent?.trim() ?? ""),
    })),
  );

  for (const row of printed) {
    const ranks = counted[row.temple];
    expect(ranks, `${row.temple} is in the summary but not in any year`).toBeTruthy();
    const total = Object.values(ranks).reduce((sum, value) => sum + value, 0);
    // Last cell is the row total; the ones before it are the ranks, in order from 1.
    expect(Number(row.cells[row.cells.length - 1]), `total for ${row.temple}`).toBe(total);
    row.cells.slice(0, -1).forEach((cell, index) => {
      const expected = ranks[index + 1] ?? 0;
      expect(cell === "—" ? 0 : Number(cell), `${row.temple} rank ${index + 1}`).toBe(expected);
    });
  }

  // Every temple that placed has to appear in the summary, not just the ones that did.
  for (const temple of Object.keys(counted)) {
    expect(printed.some((row) => row.temple === temple), `${temple} placed but is missing from the summary`).toBe(true);
  }
});

test("a year with no competition is shown as one, not left out", async ({ page }) => {
  await page.goto("/competition");
  const blank = page.locator('.competition-year[data-held="false"]');
  await expect(blank).not.toHaveCount(0);
  // Each one says what happened; a year card with an empty body would read as missing data.
  for (let index = 0; index < (await blank.count()); index += 1) {
    await expect(blank.nth(index).locator(".competition-nothing")).not.toBeEmpty();
    await expect(blank.nth(index).locator(".competition-places")).toHaveCount(0);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("the page says where the figures came from and whether they are checked", async ({ page }) => {
  await page.goto("/competition");
  const source = page.locator("#competition-source").locator("..");
  await expect(source).toContainText(/ลากพระ/);
  // Nothing on this page is verified yet, so the page has to say so rather than stay quiet.
  await expect(page.locator(".competition-pending")).toBeVisible();
});

test("an editor can record a year and it reaches the public page", async ({ page }) => {
  await login(page);
  await page.goto("/admin/competitions/new");
  await page.getByLabel("พุทธศักราช").fill(TEST_YEAR);
  await page.getByLabel("การจัดงานปีนี้").selectOption("JUDGED");

  // A judged year with no placings is refused, because it would print a year heading with
  // nothing under it and read as data that went missing.
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback")).toContainText("ต้องมีอย่างน้อยหนึ่งอันดับ");

  await page.getByRole("button", { name: /เพิ่มที่ 1/ }).click();
  await page.locator(".lesson-editor-block select").first().selectOption({ index: 1 });
  await page.getByRole("button", { name: /เพิ่มที่ 2/ }).click();
  await page.locator(".lesson-editor-block select").nth(1).selectOption({ index: 2 });
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page).toHaveURL(/\/admin\/competitions$/);
  await expect(page.locator(".admin-feedback.success")).toContainText("เพิ่มปีการประกวดแล้ว");

  const first = await page.getByRole("row").filter({ hasText: `พ.ศ. ${TEST_YEAR}` }).innerText();
  await page.goto("/competition");
  const card = page.locator(".competition-year").filter({ hasText: `พ.ศ. ${TEST_YEAR}` });
  await expect(card.locator(".competition-places li")).toHaveCount(2);
  // The temple that the admin list prints as first place is the one the page shows as ที่ 1.
  const topTemple = first.split("·")[0].replace(/^.*?1\.\s*/, "").trim();
  await expect(card.locator('.competition-places li[data-rank="1"] .competition-temple')).toContainText(topTemple);

  await page.goto("/admin/competitions");
  await page.getByRole("row").filter({ hasText: `พ.ศ. ${TEST_YEAR}` }).getByRole("link", { name: "แก้ไข" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "ลบรายการ" }).click();
  await expect(page).toHaveURL(/\/admin\/competitions$/);
  await expect(page.getByRole("row").filter({ hasText: `พ.ศ. ${TEST_YEAR}` })).toHaveCount(0);

  await page.goto("/competition");
  await expect(page.locator(".competition-year").filter({ hasText: `พ.ศ. ${TEST_YEAR}` })).toHaveCount(0);
});
