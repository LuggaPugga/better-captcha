import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const sharedTestDir = fileURLToPath(new URL("./tests/playwright", import.meta.url));

type PlaywrightConfigOptions = {
	baseURL: string;
	command: string;
};

export const createPlaywrightConfig = ({ baseURL, command }: PlaywrightConfigOptions) =>
	defineConfig({
		testDir: sharedTestDir,
		reporter: "html",
		retries: 3,
		use: {
			baseURL,
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
			{
				name: "webkit",
				testIgnore: ["captcha-fox.spec.ts"],
				use: {
					...devices["Desktop Safari"],
				},
			},
		],
		webServer: {
			command,
			url: baseURL,
			reuseExistingServer: true,
		},
	});

export const playwrightTestDir = sharedTestDir;
