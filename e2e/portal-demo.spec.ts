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
    page.getByRole("heading", { name: /already done it/i }),
  ).toBeVisible();

  // The threshold opens the ritual.
  await expect(page.getByText("Step through.")).toBeVisible({ timeout: 6000 });

  // Scanning: one possible life on screen at a time (a hard cut, not a stack).
  await expect(page.getByText(/Scanning for a version of you/i)).toBeVisible({
    timeout: 8000,
  });

  // Locking, then contact.
  await expect(page.getByText(/Locking on/i)).toBeVisible({ timeout: 8000 });
  await expect(page.getByText(/You, twelve months from now/i)).toBeVisible({
    timeout: 8000,
  });

  // Your turn: the promise lights up a word at a time.
  await expect(page.getByText("Say it with them")).toBeVisible({ timeout: 8000 });
  const words = page.locator(".affirmation-word");
  await expect(words.first()).toBeVisible();
  const total = await words.count();
  expect(total).toBeGreaterThan(0);

  await expect(page.locator(".affirmation-word.spoken")).toHaveCount(total, {
    timeout: 8000,
  });
  await expect(page.getByText(/Every word verified/i)).toBeVisible({
    timeout: 8000,
  });

  // The return: the line is carried back out through the same door, and the
  // ritual closes rather than simply stopping.
  await expect(page.getByText(/Come back\. Bring it with you/i)).toBeVisible({
    timeout: 8000,
  });
  await expect(page.getByText("Carry it into today")).toBeVisible();
  await expect(page.locator(".affirmation-word.spoken")).toHaveCount(total);

  // Same door tomorrow: the loop returns to where it began.
  await expect(page.getByText("Step through.")).toBeVisible({ timeout: 8000 });
});
