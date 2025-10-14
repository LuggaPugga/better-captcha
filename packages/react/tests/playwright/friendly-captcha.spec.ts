import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "Friendly Captcha" }).first().click();
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
	await expect(
		page.locator("script[src='https://cdn.jsdelivr.net/npm/@friendlycaptcha/sdk@0.1.32/site.min.js']"),
	).toHaveCount(1);
});

test("widget containers rendered", async () => {
	await expect(page.locator('[id^="better-captcha-w"]')).toHaveCount(1);
	await expect(page.locator("input[name='frc-captcha-response']")).toHaveCount(1);
});
