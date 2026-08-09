import type { Page, TestInfo } from "@playwright/test";

type ComponentMode = "dedicated" | "dynamic";

export async function selectComponentMode(page: Page, testInfo: TestInfo) {
	const componentMode = testInfo.project.metadata.componentMode as ComponentMode | undefined;
	const url = componentMode ? `/?componentMode=${componentMode}` : "/";
	await page.goto(url);
}
