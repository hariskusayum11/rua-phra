import "dotenv/config";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The learning routes.
 *
 * The thing worth protecting here is that the answer key never reaches the browser before
 * the learner has answered — that is the whole difference between a quiz and a list with
 * the answers written on it, and it is invisible from the rendered page.
 */

async function openDemoLesson(page: Page) {
  await page.goto("/learn");
  await page.getByRole("link", { name: /เส้นทางการเรียนรู้งานกระดาษ/ }).click();
  await expect(page).toHaveURL(/\/learn\/[^/]+$/);
  await page.getByRole("link", { name: /รู้จักเรือพระปากพะยูน/ }).click();
  await expect(page).toHaveURL(/\/learn\/[^/]+\/[^/]+$/);
}

test("the course index reaches a lesson and the lesson renders its blocks", async ({ page }) => {
  await openDemoLesson(page);
  await expect(page.getByRole("heading", { level: 1, name: "รู้จักเรือพระปากพะยูน" })).toBeVisible();
  await expect(page.locator(".lesson-text").first()).toBeVisible();
  await expect(page.locator(".lesson-activity")).toBeVisible();
  await expect(page.locator(".lesson-step-link")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("the answer key is not in the page before the learner answers", async ({ page }) => {
  await openDemoLesson(page);
  const quiz = page.locator(".lesson-quiz");
  await expect(quiz).toBeVisible();

  // The whole served document, not just the visible text — a `correct` flag hidden in the
  // RSC payload would be just as readable to a student with the network tab open.
  const html = await page.content();
  expect(html, "a correct/true flag reached the browser with the questions").not.toMatch(/"correct"\s*:\s*true/);
});

test("a wrong answer is marked wrong and the right one is shown", async ({ page }) => {
  await openDemoLesson(page);
  const questions = page.locator(".lesson-quiz-item");
  const count = await questions.count();
  expect(count).toBeGreaterThan(0);

  // Answer every question with its last choice, so at least one is wrong.
  for (let index = 0; index < count; index += 1) {
    await questions.nth(index).locator("input[type=radio]").last().check();
  }
  await page.getByRole("button", { name: "ตรวจคำตอบ" }).click();

  await expect(page.locator(".lesson-quiz-score")).toContainText(/ตอบถูก \d+ จาก \d+ ข้อ/);
  await expect(page.locator('.lesson-quiz-choice[data-state="answer"]').first()).toBeVisible();
  // Inputs lock after grading, so a learner cannot quietly change an answer post hoc.
  await expect(questions.first().locator("input[type=radio]").first()).toBeDisabled();

  await page.getByRole("button", { name: "ทำอีกครั้ง" }).click();
  await expect(page.locator(".lesson-quiz-score")).toHaveCount(0);
  await expect(questions.first().locator("input[type=radio]").first()).toBeEnabled();
});

test("answering every question correctly scores full marks", async ({ page }) => {
  await openDemoLesson(page);
  const questions = page.locator(".lesson-quiz-item");
  const count = await questions.count();

  // Find the key the only way a learner can: submit, read what was revealed, try again.
  for (let index = 0; index < count; index += 1) {
    await questions.nth(index).locator("input[type=radio]").first().check();
  }
  await page.getByRole("button", { name: "ตรวจคำตอบ" }).click();
  const total = Number((await page.locator(".lesson-quiz-score").innerText()).match(/จาก (\d+)/)?.[1] ?? "0");
  expect(total).toBeGreaterThan(0);

  const answers: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const choices = questions.nth(index).locator(".lesson-quiz-choice");
    let picked = 0;
    for (let choice = 0; choice < (await choices.count()); choice += 1) {
      if ((await choices.nth(choice).getAttribute("data-state")) === "answer") picked = choice;
    }
    answers.push(picked);
  }

  await page.getByRole("button", { name: "ทำอีกครั้ง" }).click();
  for (let index = 0; index < count; index += 1) {
    await questions.nth(index).locator("input[type=radio]").nth(answers[index]).check();
  }
  await page.getByRole("button", { name: "ตรวจคำตอบ" }).click();
  await expect(page.locator(".lesson-quiz-score")).toContainText(`ตอบถูก ${total} จาก ${total} ข้อ`);
});

test("marking a lesson done survives a reload and shows on the course page", async ({ page }) => {
  await openDemoLesson(page);
  const lessonUrl = page.url();

  await page.getByRole("button", { name: "ทำเครื่องหมายว่าเรียนแล้ว" }).click();
  await expect(page.getByRole("button", { name: "เรียนบทนี้แล้ว" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "เรียนบทนี้แล้ว" })).toBeVisible();

  await page.goto(lessonUrl.replace(/\/[^/]+$/, ""));
  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect(page.locator(".course-progress p")).toContainText("เรียนไปแล้ว 1 จาก");
});

test("an editor can author a lesson block and a learner sees it", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("รหัสผ่าน").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const stamp = Date.now();
  const slug = `browser-lesson-${stamp}`;
  await page.goto("/admin/lessons/new");
  await page.getByLabel("ชุดบทเรียน").selectOption({ index: 1 });
  await page.getByLabel("ชื่อบท").fill(`บททดสอบ ${stamp}`);
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("ลำดับบท").fill("99");

  await page.getByRole("button", { name: "เพิ่มส่วน" }).click();
  await page.getByLabel("ข้อความ").fill(`ข้อความทดสอบ ${stamp}`);
  await page.getByRole("button", { name: "บันทึกข้อมูล" }).click();
  await expect(page.locator(".admin-feedback.success")).toBeVisible();

  const course = await page.getByLabel("ชุดบทเรียน").inputValue();
  expect(course).not.toBe("");

  // The lesson is reachable from the public course page and shows what was typed.
  await page.goto("/learn");
  await page.getByRole("link").filter({ hasText: /บทเรียน$/ }).first().click();
  await page.getByRole("link", { name: new RegExp(`บททดสอบ ${stamp}`) }).click();
  await expect(page.locator(".lesson-text")).toContainText(`ข้อความทดสอบ ${stamp}`);
});
