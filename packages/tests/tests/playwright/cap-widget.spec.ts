import { type BrowserContext, expect, type Page, test } from "@playwright/test";

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
	context = await browser.newContext();
	page = await context.newPage();
	await page.goto("/");
	await page.locator("button", { hasText: "CapWidget" }).first().click();
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
	await expect(page.locator("script[src*='@cap.js/widget']")).toHaveCount(1);
});

test("widget containers rendered", async () => {
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator("cap-widget")).toBeVisible();
});

test("widget can be executed", async () => {
	await page.locator("button", { hasText: "Execute" }).first().click();
	const input = page.locator("input[name='cap-token']");
	await input.waitFor({ state: "attached" });

	await page.waitForFunction(() => {
		const el = document.querySelector("input[name='cap-token']") as HTMLInputElement;
		return el?.value && el.value.trim().length > 0;
	});
});

test("onSolve callback fires", async () => {
	await expect(page.locator("#captcha-solved")).toBeVisible({ timeout: 10000 });
	await expect(page.locator("#captcha-solved")).toHaveText("Captcha Solved!");
});

test("widget has response", async () => {
	await page.locator("button", { hasText: "Get Response" }).first().click();
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator("#captcha-response")).toBeVisible();
	await expect(page.locator("#captcha-response")).not.toHaveText("No response");
	await expect(page.locator("#captcha-response")).not.toHaveText("");
});

test("widget can be reset", async () => {
	await page.locator("button", { hasText: "Reset" }).first().click();
	await page.waitForTimeout(100);
	await expect(page.locator('[id^="better-captcha-"]')).toHaveCount(1);
	await expect(page.locator("cap-widget")).toBeVisible();
});

test("widget can be destroyed", async () => {
	await page.locator("button", { hasText: "Destroy" }).first().click();
	await expect(page.locator("cap-widget")).toHaveCount(0);
});

test("widget can be rendered after destroy", async () => {
	await page.locator("button", { hasText: "Render" }).first().click();
	await page.locator("cap-widget").waitFor({ state: "visible", timeout: 5000 });
	await expect(page.locator("cap-widget")).toHaveCount(1);
	await expect(page.locator("cap-widget")).toBeVisible();
});
