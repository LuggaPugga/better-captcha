import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "Captcha Fox" }).first().click();
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
	const scriptLocator = page.locator("script[src*='https://cdn.captchafox.com/api.js']");
	await expect(scriptLocator).toHaveCount(1);
});

test("widget containers rendered", async () => {
	const containerLocator = page.locator('[id^="better-captcha-"]');
	const widgetLocator = page.locator('[id^="cf-widget-"]');
	await expect(containerLocator).toHaveCount(1);
	await widgetLocator.waitFor({ state: "attached" });
	await page.waitForLoadState("networkidle");
});

test("widget can be executed", async () => {
	const containerLocator = page.locator('[id^="better-captcha-"]');
	const widgetLocator = page.locator('[id^="cf-widget-"]');
	const successLocator = page.locator('div[class*="cf-success"]');
	await page.locator("button", { hasText: "Execute" }).first().click();
	await expect(containerLocator).toHaveCount(1);
	await expect(widgetLocator).toHaveCount(1);
	await successLocator.waitFor({ state: "attached" });
	await expect(successLocator).toHaveCount(1);
});

test("widget has response", async () => {
	const responseLocator = page.locator("#captcha-response");
	await page.locator("button", { hasText: "Get Response" }).first().click();
	await responseLocator.waitFor({ state: "visible" });
	await expect(responseLocator).not.toHaveText("No response");
	await expect(responseLocator).not.toHaveText("");

	await page.locator("#captcha-solved").waitFor({ state: "visible" });
	await expect(page.locator("#captcha-solved")).toHaveText("Captcha Solved!");
});

test("widget can be reset", async () => {
	const widgetLocator = page.locator("[id^='cf-widget-']");
	await expect(widgetLocator).toHaveCount(1);
	const before = await page.locator('[id^="better-captcha-"]').count();
	await page.locator("button", { hasText: "Reset" }).first().click();
	await page.waitForLoadState("networkidle");
	const after = await page.locator('[id^="better-captcha-"]').count();
	expect(before).toBe(after);
	await expect(widgetLocator).toHaveCount(1);
});

test("widget can change theme", async () => {
	const themes = ["light", "dark", "auto"];

	for (let i = 0; i < themes.length; i++) {
		const widgetLocator = page.locator('[id^="cf-widget"]').first();
		await page.locator("button", { hasText: "Change Theme" }).first().click();

		await widgetLocator.waitFor({ state: "visible" });

		const widgetCountAfter = await page.locator('[id^="cf-widget"]').count();

		expect(widgetCountAfter).toBeGreaterThanOrEqual(1);
	}
});

test("widget can be destroyed", async () => {
	const loadingLocator = page.locator('[id^="better-captcha-loading"]');
	const widgetLocator = page.locator('[id^="cf-widget"]');
	await expect(loadingLocator).toHaveCount(0);
	await page.locator("button", { hasText: "Destroy" }).first().click();
	await loadingLocator.waitFor({ state: "attached" });
	await expect(widgetLocator).toHaveCount(0);
	await expect(loadingLocator).toHaveCount(1);
});

test("widget can be rendered after destroy", async () => {
	const widgetLocator = page.locator('[id^="cf-widget"]');
	await page.locator("button", { hasText: "Render" }).first().click();
	await widgetLocator.waitFor({ state: "visible" });
	await expect(widgetLocator).toHaveCount(1);
	await expect(widgetLocator.first()).toBeVisible();
});
