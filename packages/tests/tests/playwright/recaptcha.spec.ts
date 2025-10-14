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
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await page.locator("iframe[title*='reCAPTCHA']").waitFor({ state: "attached" });
	await expect(page.locator("iframe[title*='reCAPTCHA']")).toHaveCount(1);
});

test("widget has response", async () => {
	const recaptchaFrame = page.frameLocator("iframe[title*='reCAPTCHA']");
	await recaptchaFrame.locator(".recaptcha-checkbox-border").click();

	await recaptchaFrame.locator(".recaptcha-checkbox-checkmark").waitFor({ state: "visible" });
	await expect(recaptchaFrame.locator(".recaptcha-checkbox-checkmark")).toBeVisible();

	await page.waitForTimeout(1000);

	await page.locator("button", { hasText: "Get Response" }).first().click();
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator("#captcha-response")).toBeVisible();
	await expect(page.locator("#captcha-response")).not.toHaveText("No response");
	await expect(page.locator("#captcha-response")).not.toHaveText("");
});

test("widget can be reset", async () => {
	const before = await page.locator('[id^="better-captcha-"]');
	await page.locator("button", { hasText: "Reset" }).first().click();
	await expect(before !== page.locator('[id^="better-captcha-"]')).toBe(true);
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
});

test("widget can change theme", async () => {
	const themes = ["light", "dark", "auto"];

	for (let i = 0; i < themes.length; i++) {
		const widgetBefore = page.locator('[id^="better-captcha-"]').first();
		await page.locator("button", { hasText: "Change Theme" }).first().click();

		await page.waitForTimeout(100);

		const widgetAfter = page.locator('[id^="better-captcha-"]').first();

		await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
		await expect(widgetAfter).toBeVisible();

		expect(widgetBefore).not.toBe(widgetAfter);
	}
});

test("widget can be destroyed", async () => {
	await expect(page.locator('[id^="better-captcha-loading"]')).toHaveCount(0);
	await page.locator("button", { hasText: "Destroy" }).first().click();
	await expect(page.locator('[id^="better-captcha-loading"]')).toHaveCount(1);
});
