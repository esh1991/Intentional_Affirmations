import { test, expect } from "@playwright/test";

/**
 * Signal degradation must be atmosphere only. The load-bearing assertion is
 * the last one: someone returning after weeks away has to be able to use the
 * page perfectly, so nothing may be hidden, blocked, or made unreadable.
 */
async function seed(page: import("@playwright/test").Page, daysAway: number) {
  await page.addInitScript((d: number) => {
    const last = new Date(Date.now() - d * 86400000).toDateString();
    window.localStorage.setItem(
      "mindsetEnginePortal",
      JSON.stringify({ domain: "craft", goal: "shipped it", horizon: "1y", tunedAt: last }),
    );
    window.localStorage.setItem("mindsetEngineLastPractice", last);
    window.localStorage.setItem(
      "mindsetEngineJourneys",
      JSON.stringify({ "powerUp/A Decisive Leader": { duration: 7, startedAt: last, completedDays: [last] } }),
    );
  }, daysAway);
}

test("the channel degrades with absence and never blocks practice", async ({ page }) => {
  // Fresh: clean signal, no note.
  await seed(page, 0);
  await page.goto("/pact");
  await expect(page.getByText(/signal has drifted|faint from here|been a while/i)).toHaveCount(0);

  // Away a fortnight: degraded, with an invitation rather than a scold.
  await seed(page, 14);
  await page.goto("/pact");
  const note = page.getByText(/it's been a while/i);
  await expect(note).toBeVisible();
  await expect(page.getByText(/streak lost|you failed|broken/i)).toHaveCount(0);

  const noise = await page
    .locator(".signal")
    .first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--signal-noise").trim());
  expect(Number(noise)).toBeGreaterThan(0.5);

  // The whole point: it is still fully usable.
  await expect(page.getByText(/Day \d+ of \d+/)).toBeVisible();
  await page.getByRole("button", { name: /type it instead/i }).click();
  const words = await page.locator(".affirmation-word").allTextContents();
  await page.getByPlaceholder(/type the affirmation/i).fill(words.join(" "));
  await page.getByRole("button", { name: "I said it" }).click();

  // And it clears on completion — not next visit, now.
  await expect(page.getByText(/Received\. Word for word/i)).toBeVisible();
  const after = await page
    .locator(".signal")
    .first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--signal-noise").trim());
  expect(Number(after)).toBe(0);
});
