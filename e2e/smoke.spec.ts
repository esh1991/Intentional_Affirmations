import { test, expect } from "@playwright/test";

/**
 * Core-flow smoke test: the daily call at /pact — commit to an arc, read the
 * line back by typing, and land on the return screen with progress recorded.
 *
 * Rewritten at the M5 cutover: this used to enter through /practice, which no
 * longer exists. Drives the typing path — deterministic, no mic in CI.
 */
test("the daily call completes day 1 via typing", async ({ page }) => {
  // Coordinates normally come from the portal. Seeding them directly keeps
  // this test about the speaking flow rather than re-walking the sequence,
  // which portal-flow.spec.ts already covers end to end.
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "mindsetEnginePortal",
      JSON.stringify({
        domain: "craft",
        goal: "shipped the thing",
        horizon: "1y",
        tunedAt: new Date().toDateString(),
      }),
    );
  });

  await page.goto("/pact");

  // First visit: commit to a duration.
  await expect(
    page.getByRole("heading", { name: /how long do you want the line open/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /7\s*days/i }).click();

  // Today's line, with progress showing.
  await expect(page.getByText("Day 1 of 7")).toBeVisible();
  await expect(page.getByRole("img", { name: "0 of 7 days completed" })).toBeVisible();

  // Typing fallback: transcribe the line shown on screen.
  await page.getByRole("button", { name: /type it instead/i }).click();
  const words = await page.locator(".affirmation-word").allTextContents();
  expect(words.length).toBeGreaterThan(0);
  await page.getByPlaceholder(/type the affirmation/i).fill(words.join(" "));

  // Live highlighting: every typed word lights up.
  await expect(page.locator(".affirmation-word.spoken")).toHaveCount(words.length);

  await page.getByRole("button", { name: "I said it" }).click();

  // The return: the reward lands on the way back out, not at verification.
  await expect(page.getByText(/Received\. Word for word/i)).toBeVisible();
  await expect(page.getByRole("img", { name: "1 of 7 days completed" })).toBeVisible();
  await expect(page.getByText(/1 day in a row/i)).toBeVisible();
  await expect(page.getByText("Same door tomorrow.")).toBeVisible();
});
