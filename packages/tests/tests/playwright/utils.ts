import type { Page, TestInfo } from "@playwright/test";

type ComponentMode = "dedicated" | "dynamic";

export async function selectComponentMode(page: Page, testInfo: TestInfo) {
	const componentMode = testInfo.project.metadata.componentMode as ComponentMode | undefined;
	if (!componentMode) return;

	const label = componentMode === "dynamic" ? "Dynamic Component" : "Dedicated Component";
	const button = page.locator("button", { hasText: label }).first();

	if ((await button.count()) > 0) {
		await button.click();
	}
}
