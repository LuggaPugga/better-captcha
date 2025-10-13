import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "tests/playwright",
	reporter: "html",
	use: {
		baseURL: "http://localhost:9000",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},
		{
			name: "firefox",
			use: {
				...devices["Desktop Firefox"],
			},
		},
	],
	webServer: {
		command: "cd ../../apps/testing-page && bun run dev",
		url: "http://localhost:9000",
		reuseExistingServer: true,
	},
});
