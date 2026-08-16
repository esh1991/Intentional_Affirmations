import { test, expect } from "@playwright/test";

/**
 * The log is the record of work actually done, so the thing to prove is that
 * completing a line puts it there — not merely that the page renders.
 */
test("a completed line appears in the log", async ({ page }) => {
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

  // Empty state first.
  await page.goto("/log");
  await expect(
    page.getByRole("heading", { name: /nothing has come through yet/i }),
  ).toBeVisible();

  // Complete today's line.
  await page.goto("/pact");
  await page.getByRole("button", { name: /7\s*days/i }).click();
  await page.getByRole("button", { name: /type it instead/i }).click();
  const words = await page.locator(".affirmation-word").allTextContents();
  const line = words.join(" ");
  await page.getByPlaceholder(/type the affirmation/i).fill(line);
  await page.getByRole("button", { name: "I said it" }).click();
  await expect(page.getByText(/Received\. Word for word/i)).toBeVisible();

  // It is in the log, filed under today, with the counts updated.
  await page.getByRole("link", { name: /see everything they/i }).click();
  await expect(page).toHaveURL(/\/log$/);
  await expect(page.getByRole("heading", { name: /everything they/i })).toBeVisible();
  await expect(page.getByText("Today")).toBeVisible();
  await expect(page.getByText(line, { exact: true })).toBeVisible();
  // The count and its label are separate elements, so assert the pill as a
  // whole rather than one text node.
  const stat = page.locator("span", { hasText: /^1line said$/ }).first();
  await expect(stat).toBeVisible();

  // Clearance starts at the bottom and reports what actually changed, plus
  // how far the next level is. One day of practice must not skip a level.
  await expect(page.getByText(/Clearance 1 · Contact/)).toBeVisible();
  await expect(page.getByText(/2 more days to Open channel/)).toBeVisible();
});
