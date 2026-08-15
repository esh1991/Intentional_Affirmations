import { test, expect } from "@playwright/test";

/**
 * The portal demo is the marketing centrepiece and it self-plays, so a stuck
 * phase would be invisible without a test. Walks the whole ritual: threshold →
 * scanning → locking → contact → the promise lighting up word by word → the
 * return, and back to the same door.
 */
test("portal demo runs the full ritual and closes the loop", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /isn.t allowed to tell you/i }),
  ).toBeVisible();

  // Scope every assertion to the demo: the reframed hero and the steps repeat
  // this vocabulary, so unscoped text lookups match three elements.
  const demo = page.getByLabel(/Demo: reaching your future self/i);

  // The threshold opens the ritual.
  await expect(demo.getByText("Step through.")).toBeVisible({ timeout: 6000 });

  // Scanning: one possible life on screen at a time (a hard cut, not a stack).
  await expect(demo.getByText(/Scanning for a version of you/i)).toBeVisible({
    timeout: 8000,
  });

  // Locking, then contact.
  await expect(demo.getByText(/Locking on/i)).toBeVisible({ timeout: 8000 });
  await expect(demo.getByText(/You, twelve months from now/i)).toBeVisible({
    timeout: 8000,
  });

  // Your turn: the line they sent is read back a word at a time.
  await expect(demo.getByText("Read it back", { exact: true })).toBeVisible({ timeout: 8000 });
  const words = demo.locator(".affirmation-word");
  await expect(words.first()).toBeVisible();
  const total = await words.count();
  expect(total).toBeGreaterThan(0);

  await expect(demo.locator(".affirmation-word.spoken")).toHaveCount(total, {
    timeout: 8000,
  });
  await expect(demo.getByText(/Received\. Word for word/i)).toBeVisible({
    timeout: 8000,
  });

  // The return: the line is carried back out through the same door, and the
  // ritual closes rather than simply stopping.
  await expect(demo.getByText(/Come back\. Bring it with you/i)).toBeVisible({
    timeout: 8000,
  });
  await expect(demo.getByText("Take it into today", { exact: true })).toBeVisible();
  await expect(demo.locator(".affirmation-word.spoken")).toHaveCount(total);

  // Same door tomorrow: the loop returns to where it began.
  await expect(demo.getByText("Step through.")).toBeVisible({ timeout: 8000 });
});
