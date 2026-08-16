import { test, expect } from "@playwright/test";

/**
 * The portal end to end without a generated portrait — which is the point:
 * the reveal is the hook, the rep is the product, so the sequence must run
 * and hand off to the speaking flow whether or not generation is configured.
 */
test("portal tunes, runs the sequence, and hands off a line to speak", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /open the channel/i }).click();
  await expect(page).toHaveURL(/\/portal$/);

  // Tune: pick a domain, then the rest of the form appears.
  await expect(
    page.getByRole("heading", { name: /which version of you should we reach/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /the version of me who did the work/i }).click();
  await page.getByLabel(/what did they do that you haven/i).fill("shipped the thing");
  await page.getByRole("button", { name: "A year" }).click();
  await page.getByRole("button", { name: /open the channel/i }).click();

  // The ritual: cross, scan, contact.
  await expect(page.getByText("Step through.")).toBeVisible({ timeout: 6000 });
  await expect(page.getByText(/Looking for them/i)).toBeVisible({ timeout: 8000 });
  await expect(page.getByText(/You, a year from now/i)).toBeVisible({ timeout: 10000 });

  // The restriction is visibly enforced, not merely marked up. The .redacted
  // CSS shipped missing once and the withheld text rendered in the clear, so
  // this asserts the computed paint, not the class name.
  const bar = page.getByLabel("redacted");
  await expect(bar).toBeVisible();
  const painted = await bar.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, background: cs.backgroundColor };
  });
  expect(painted.color).toBe("rgba(0, 0, 0, 0)");
  expect(painted.background).not.toBe("rgba(0, 0, 0, 0)");

  // The line they are cleared to send, then the hand-off into speaking.
  await expect(page.getByText("One line is cleared to send")).toBeVisible({ timeout: 10000 });
  const promise = page.locator(".affirmation-word");
  expect(await promise.count()).toBeGreaterThan(0);

  await page.getByRole("link", { name: /read it back out loud/i }).click();
  await expect(page).toHaveURL(/\/practice\//);

  // The hand-off lands on the commitment picker — 7 or 21 days — which is the
  // right next beat after receiving the line, not a dead end. /pact collapses
  // this into the daily call in M4.
  await expect(
    page.getByRole("heading", { name: /how long do you want to commit/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /kickstart/i }).click();
  await expect(page.getByText("Day 1 of 7")).toBeVisible();
});
