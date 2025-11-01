import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "hCaptcha" }).first().click();
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
		page.locator("script[src*='https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off&onload=']"),
	).toHaveCount(1);
});

test("widget containers rendered", async () => {
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await page.locator("iframe[data-hcaptcha-widget-id]").waitFor({ state: "attached" });
	await expect(page.locator("iframe[data-hcaptcha-widget-id]")).toHaveCount(1);
});

test("widget can be executed", async () => {
	await page.locator("button", { hasText: "Execute" }).first().click();
	await page
		.locator("iframe[data-hcaptcha-response='10000000-aaaa-bbbb-cccc-000000000001']")
		.waitFor({ state: "attached" });
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);

	await expect(page.locator("#captcha-solved")).toBeVisible({ timeout: 10000 });
	await expect(page.locator("#captcha-solved")).toHaveText("Captcha Solved!");
});

test("widget has response", async () => {
	await page.locator("button", { hasText: "Get Response" }).first().click();
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator("iframe[data-hcaptcha-response='10000000-aaaa-bbbb-cccc-000000000001']")).toHaveCount(1);
	await expect(page.locator("#captcha-response")).toBeVisible();
	await expect(page.locator("#captcha-response")).not.toHaveText("No response");
	await expect(page.locator("#captcha-response")).not.toHaveText("");
});

test("widget can be reset", async () => {
	await expect(page.locator("iframe[data-hcaptcha-response='10000000-aaaa-bbbb-cccc-000000000001']")).toHaveCount(1);
	const before = await page.locator('[id^="better-captcha-"]');
	await page.locator("button", { hasText: "Reset" }).first().click();
	await expect(before !== page.locator('[id^="better-captcha-"]')).toBe(true);
	await expect(page.locator("iframe[data-hcaptcha-response='10000000-aaaa-bbbb-cccc-000000000001']")).toHaveCount(0);
	await expect(page.locator("iframe[data-hcaptcha-response]")).toHaveCount(1);
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

test("widget can be rendered after destroy", async () => {
	await page.locator("button", { hasText: "Render" }).first().click();
	await page.locator('[id^="better-captcha-"]').waitFor({ state: "visible", timeout: 5000 });
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator('[id^="better-captcha-"]').first()).toBeVisible();
});
