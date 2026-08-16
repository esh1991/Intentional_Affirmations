import { test, expect } from "@playwright/test";

/** Nothing that pointed at the retired browse hub may 404. */
test("retired practice URLs redirect to the portal", async ({ page }) => {
  for (const url of ["/practice", "/practice/powerUp/A%20Decisive%20Leader", "/?mode=breakIt"]) {
    const res = await page.goto(url);
    expect(res?.status(), `${url} status`).toBeLessThan(400);
    // Query strings pass through the redirect, so match the path only.
    await expect(page, `${url} lands on portal`).toHaveURL(/\/portal(\?|$)/);
  }
});

/** Every nav and footer link resolves. */
test("no dead links in the chrome", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.locator("a[href^='/']").evaluateAll((as) =>
    Array.from(new Set(as.map((a) => a.getAttribute("href")!))),
  );
  const bad: string[] = [];
  for (const href of hrefs) {
    const res = await page.request.get(href);
    if (res.status() >= 400) bad.push(`${href} -> ${res.status()}`);
  }
  console.log("checked", hrefs.length, "links:", hrefs.join(" "));
  expect(bad, `dead links: ${bad.join(", ")}`).toEqual([]);
});
