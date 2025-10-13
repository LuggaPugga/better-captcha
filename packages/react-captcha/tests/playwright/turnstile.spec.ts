import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "Turnstile" }).first().click();
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
	await expect(page.locator("script[src*='turnstile']")).toHaveCount(1);
});

test("widget containers rendered", async () => {
	await expect(page.locator('[id^="react-captcha-"]')).toHaveCount(1);
	await expect(page.locator('[id^="react-captcha-cf-chl"]')).toBeVisible();
});

test("widget has response", async () => {
	await page
		.locator('input[value="XXXX.DUMMY.TOKEN.XXXX"]')
		.waitFor({ state: "attached" });
	await page.locator("button", { hasText: "Get Response" }).first().click();
	await expect(page.locator('[id^="react-captcha-cf-chl"]')).toHaveCount(1);
	await expect(page.locator("#captcha-response")).toBeVisible();
	await expect(page.locator("#captcha-response")).not.toHaveText("No response");
	await expect(page.locator("#captcha-response")).not.toHaveText("");
});

test("widget can be reset", async () => {
	const before = page.locator('[id^="react-captcha-cf-chl"]');
	await page.locator("button", { hasText: "Reset" }).first().click();
	await expect(before !== page.locator('[id^="react-captcha-cf-chl"]')).toBe(true);
	await expect(page.locator('[id^="react-captcha-cf-chl"]')).toHaveCount(1);
});

test("widget can change theme", async () => {
	const themes = ["light", "dark", "auto"];

	for (let i = 0; i < themes.length; i++) {
		const widgetBefore = page.locator('[id^="react-captcha-cf-chl"]').first();
		const widgetIdBefore = await widgetBefore.getAttribute("id");
		await page.locator("button", { hasText: "Change Theme" }).first().click();

		await page.waitForTimeout(100);

		const widgetAfter = page.locator('[id^="react-captcha-cf-chl"]').first();
		const widgetIdAfter = await widgetAfter.getAttribute("id");

		await expect(page.locator('[id^="react-captcha-cf-chl"]')).toHaveCount(1);
		await expect(widgetAfter).toBeVisible();

		expect(widgetIdBefore).not.toBe(widgetIdAfter);
	}
});

test("widget can be destroyed", async () => {
	await page.locator("button", { hasText: "Destroy" }).first().click();
	await expect(page.locator('[id^="react-captcha-cf-chl"]')).toHaveCount(0);
});
