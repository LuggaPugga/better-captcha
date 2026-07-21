import { createPlaywrightConfig, withComponentModes } from "@better-captcha/tests/playwright-config";

export default withComponentModes(
	createPlaywrightConfig({
		baseURL: "http://localhost:9005",
		command: "cd ../../apps/testing/lit && bun run dev",
	}),
);
