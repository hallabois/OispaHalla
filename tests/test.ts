import { expect, test } from "@playwright/test";

test("correct starting scores", async ({ page }) => {
	await page.goto("/");
	expect(await page.textContent(".score-container")).toBe("0");
	expect(await page.textContent(".best-container")).toBe("0");
});
