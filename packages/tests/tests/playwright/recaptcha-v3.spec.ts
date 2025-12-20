import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "reCAPTCHA v3" }).first().click();
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
	await expect(page.locator("script[src*='https://www.google.com/recaptcha/api.js?render=']")).toHaveCount(1);
});

test("widget auto-generates response", async () => {
	await page.locator("#captcha-solved").waitFor({ state: "visible", timeout: 10000 });
	await page.locator("button", { hasText: "Get Response" }).first().click();
	await expect(page.locator("#captcha-response")).toBeVisible();
	await expect(page.locator("#captcha-response")).not.toHaveText("No response");
	await expect(page.locator("#captcha-response")).not.toHaveText("");
	await expect(page.locator("#captcha-solved")).toHaveText("Captcha Solved!");
});

test("widget can be reset", async () => {
	await page.locator("button", { hasText: "Reset" }).first().click();
	await page.waitForTimeout(500);
	await page.locator("button", { hasText: "Get Response" }).first().click();
	await expect(page.locator("#captcha-response")).toHaveText("No response");
});

test("widget can be destroyed", async () => {
	await expect(page.locator('[id^="better-captcha-loading"]')).toHaveCount(0);
	await page.locator("button", { hasText: "Destroy" }).first().click();
	await page.waitForTimeout(500);
	await expect(page.locator('[id^="better-captcha-loading"]')).toHaveCount(1);
});
