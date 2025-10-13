import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "reCAPTCHA" }).first().click();
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
		page.locator("script[src*='https://www.google.com/recaptcha/api.js?render=explicit&onload=']"),
	).toHaveCount(1);
});

test("widget containers rendered", async () => {
	await expect(page.locator('[id^="react-captcha-"]')).toHaveCount(1);
	await expect(page.locator("iframe[title*='reCAPTCHA']")).toBeVisible();
});

test("widget has response", async () => {
	await page.waitForTimeout(200);
	await page.click("iframe[title*='reCAPTCHA']");
	await page.waitForTimeout(2000);

	await page.locator("button", { hasText: "Get Response" }).first().click();
	await expect(page.locator('[id^="react-captcha-"]')).toHaveCount(1);
	await expect(page.locator("#captcha-response")).toBeVisible();
	await expect(page.locator("#captcha-response")).not.toHaveText("No response");
	await expect(page.locator("#captcha-response")).not.toHaveText("");
});

test("widget can be reset", async () => {
	const before = await page.locator('[id^="react-captcha-"]');
	await page.locator("button", { hasText: "Reset" }).first().click();
	await expect(before !== page.locator('[id^="react-captcha-"]')).toBe(true);
	await expect(page.locator('[id^="react-captcha-"]')).toHaveCount(1);
});

test("widget can change theme", async () => {
	const themes = ["light", "dark", "auto"];

	for (let i = 0; i < themes.length; i++) {
		const widgetBefore = page.locator('[id^="react-captcha-"]').first();
		await page.locator("button", { hasText: "Change Theme" }).first().click();

		await page.waitForTimeout(100);

		const widgetAfter = page.locator('[id^="react-captcha-"]').first();

		await expect(page.locator('[id^="react-captcha-"]')).toHaveCount(1);
		await expect(widgetAfter).toBeVisible();

		expect(widgetBefore).not.toBe(widgetAfter);
	}
});

test("widget can be destroyed", async () => {
	await expect(page.locator('[id^="react-captcha-loading"]')).toHaveCount(0);
	await page.locator("button", { hasText: "Destroy" }).first().click();
	await expect(page.locator('[id^="react-captcha-loading"]')).toHaveCount(1);
});
