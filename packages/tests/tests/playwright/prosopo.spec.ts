import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "Prosopo" }).first().click();
});

test.afterAll(async () => {
	if (page) {
		await page.close();
	}
	if (context) {
		await context.close();
	}
});

test("script injected", async () => {
	await expect(page.locator("script[src*='https://js.prosopo.io/js/procaptcha.bundle.js']")).toHaveCount(1);
});

test("widget containers rendered", async () => {
	await page.locator("prosopo-procaptcha").waitFor({ state: "visible" });
	await expect(page.locator("prosopo-procaptcha")).toHaveCount(1);
});
