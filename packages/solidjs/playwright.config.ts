import { createPlaywrightConfig, withComponentModes } from "@better-captcha/tests/playwright-config";

export default withComponentModes(
	createPlaywrightConfig({
		baseURL: "http://localhost:9001",
		command: "cd ../../apps/testing/solidjs && bun run dev",
	}),
);
