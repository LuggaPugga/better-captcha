import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "Altcha" }).first().click();
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
	await expect(page.locator("script[src*='altcha']")).toHaveCount(1);
});

test("widget containers rendered", async () => {
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator("altcha-widget")).toBeVisible();
});

test("widget can be executed", async () => {
	await page.locator("button", { hasText: "Reset" }).first().click();
	await page.locator("altcha-widget").waitFor({ state: "visible" });
	await page.locator("button", { hasText: "Execute" }).first().click();
	await page.waitForSelector("text=Verification failed. Try again later.", { timeout: 15000 });
	await expect(page.locator("text=Verification failed. Try again later.")).toBeVisible();
});

test("widget can be reset", async () => {
	await page.locator("button", { hasText: "Reset" }).first().click();
	await page.locator("altcha-widget").waitFor({ state: "visible" });
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator("altcha-widget")).toBeVisible();
});

test("widget can be destroyed", async () => {
	await page.locator("button", { hasText: "Destroy" }).first().click();
	await expect(page.locator("altcha-widget")).toHaveCount(0);
});

test("widget can be rendered after destroy", async () => {
	await page.locator("button", { hasText: "Render" }).first().click();
	await page.locator("altcha-widget").waitFor({ state: "visible", timeout: 5000 });
	await expect(page.locator("altcha-widget")).toHaveCount(1);
	await expect(page.locator("altcha-widget")).toBeVisible();
});
