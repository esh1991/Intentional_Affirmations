import { test, expect } from "@playwright/test";

/**
 * Core-flow smoke test (docs/roadmap/phase-1-rebuild.md M5): marketing home →
 * practice hub → journey picker → day 1 → typed completion → win screen.
 * Drives the typing path — deterministic, no mic in CI.
 */
test("speak-it flow completes day 1 of a journey via typing", async ({ page }) => {
  // Marketing home → practice hub
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /don't just read affirmations/i }),
  ).toBeVisible();
  await page.getByRole("link", { name: /start practicing/i }).click();
  await expect(page).toHaveURL(/\/practice$/);

  // Default mode is Power Up; open its first category
  await page.getByRole("link", { name: /a decisive leader/i }).click();

  // Journey picker → commit to 7 days
  await expect(
    page.getByRole("heading", { name: /how long do you want to commit/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /kickstart/i }).click();

  // Day 1 of 7, no dots filled yet
  await expect(page.getByText("Day 1 of 7")).toBeVisible();
  await expect(page.getByRole("img", { name: "0 of 7 days completed" })).toBeVisible();

  // Typing fallback: transcribe the affirmation shown on screen
  await page.getByRole("button", { name: /type it instead/i }).click();
  const words = await page.locator(".affirmation-word").allTextContents();
  expect(words.length).toBeGreaterThan(0);
  await page
    .getByPlaceholder(/type the affirmation/i)
    .fill(words.join(" "));

  // Live highlighting: every typed word lights up
  await expect(page.locator(".affirmation-word.spoken")).toHaveCount(words.length);

  await page.getByRole("button", { name: "I said it" }).click();

  // Win screen: day complete, first dot lit, streak started
  await expect(page.getByRole("heading", { name: "Day 1 complete!" })).toBeVisible();
  await expect(page.getByRole("img", { name: "1 of 7 days completed" })).toBeVisible();
  await expect(page.getByText(/day 1 streak/i)).toBeVisible();

  // Back on the hub, the card now shows journey progress
  await page.getByRole("link", { name: "All categories" }).click();
  await expect(page.getByRole("link", { name: /a decisive leader/i })).toContainText(
    "Day 2 of 7",
  );
});
