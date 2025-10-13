import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "Private Captcha" }).first().click();
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
		page.locator("script[src*='https://cdn.privatecaptcha.com/widget/js/privatecaptcha.js?render=explicit']"),
	).toHaveCount(1);
});

test("widget containers rendered", async () => {
	await expect(page.locator('[id^="react-captcha-"]')).toHaveCount(1);
	await expect(page.locator('[id^="react-captcha-private-captcha"]')).toBeVisible();
});

test("widget can be executed", async () => {
	await page.locator("button", { hasText: "Execute" }).first().click();
	await page.waitForTimeout(500);
	await expect(page.locator('[id^="react-captcha-private-captcha"]')).toHaveCount(1);
});

test("widget has response", async () => {
	await page.locator("button", { hasText: "Get Response" }).first().click();
	await expect(page.locator('[id^="react-captcha-private-captcha"]')).toHaveCount(1);
	await expect(page.locator("#captcha-response")).toBeVisible();
	await expect(page.locator("#captcha-response")).not.toHaveText("No response");
	await expect(page.locator("#captcha-response")).not.toHaveText("");
});

test("widget can be reset", async () => {
	const before = await page.locator('[id^="react-captcha-private-captcha"]');
	await page.locator("button", { hasText: "Reset" }).first().click();
	await expect(before !== page.locator('[id^="react-captcha-private-captcha"]')).toBe(true);
	await expect(page.locator('[id^="react-captcha-private-captcha"]')).toHaveCount(1);
});

test("widget can change theme", async () => {
	const themes = ["light", "dark", "auto"];

	for (let i = 0; i < themes.length; i++) {
		const widgetBefore = page.locator('[id^="react-captcha-private-captcha"]').first();
		const widgetIdBefore = await widgetBefore.getAttribute("id");
		await page.locator("button", { hasText: "Change Theme" }).first().click();

		await page.waitForTimeout(100);

		const widgetAfter = page.locator('[id^="react-captcha-private-captcha"]').first();
		const widgetIdAfter = await widgetAfter.getAttribute("id");

		await expect(page.locator('[id^="react-captcha-private-captcha"]')).toHaveCount(1);
		await expect(widgetAfter).toBeVisible();

		expect(widgetIdBefore).not.toBe(widgetIdAfter);
	}
});

test("widget can be destroyed", async () => {
	await page.locator("button", { hasText: "Destroy" }).first().click();
	await expect(page.locator('[id^="react-captcha-private-captcha"]')).toHaveCount(0);
});
