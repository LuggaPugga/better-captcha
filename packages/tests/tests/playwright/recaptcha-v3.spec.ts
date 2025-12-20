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

test("widget containers rendered", async () => {
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator('[id^="better-captcha-"]').first()).toBeVisible();
});

test("widget has response", async () => {
	await page.waitForTimeout(2000);
	await page.locator("#captcha-solved").waitFor({ state: "visible", timeout: 10000 });
	await page.locator("button", { hasText: "Get Response" }).first().click();
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator("#captcha-response")).toBeVisible();
	await expect(page.locator("#captcha-response")).not.toHaveText("No response");
	await expect(page.locator("#captcha-response")).not.toHaveText("");
	await expect(page.locator("#captcha-solved")).toHaveText("Captcha Solved!");
});

test("widget can be reset", async () => {
	const before = await page.locator('[id^="better-captcha-"]').first().getAttribute("id");
	await page.locator("button", { hasText: "Reset" }).first().click();
	await page.waitForTimeout(500);
	const after = await page.locator('[id^="better-captcha-"]').first().getAttribute("id");
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	expect(before).toBe(after);
});

test("widget can change action", async () => {
	const actions = ["submit", "login", "register"];

	for (let i = 0; i < actions.length; i++) {
		await page.locator("button", { hasText: "Change Action" }).first().click();
		await page.waitForTimeout(1000);

		await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
		await expect(page.locator('[id^="better-captcha-"]').first()).toBeVisible();
	}
});

test("widget can be destroyed", async () => {
	await expect(page.locator('[id^="better-captcha-loading"]')).toHaveCount(0);
	await page.locator("button", { hasText: "Destroy" }).first().click();
	await page.waitForTimeout(500);
	await expect(page.locator('[id^="better-captcha-loading"]')).toHaveCount(1);
});

test("widget can be rendered after destroy", async () => {
	await page.locator("button", { hasText: "Render" }).first().click();
	await page.locator('[id^="better-captcha-"]').waitFor({ state: "visible", timeout: 5000 });
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator('[id^="better-captcha-"]').first()).toBeVisible();
});

test("widget can execute", async () => {
	await page.waitForTimeout(1000);
	const responseBefore = await page.locator("#captcha-response").textContent();
	await page.locator("button", { hasText: "Execute" }).first().click();
	await page.waitForTimeout(2000);
	await page.locator("button", { hasText: "Get Response" }).first().click();
	await page.waitForTimeout(500);
	const responseAfter = await page.locator("#captcha-response").textContent();
	expect(responseAfter).not.toBe(responseBefore);
	expect(responseAfter).not.toBe("No response");
	expect(responseAfter).not.toBe("");
});
