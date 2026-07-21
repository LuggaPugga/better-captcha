import { createPlaywrightConfig, withComponentModes } from "@better-captcha/tests/playwright-config";

export default withComponentModes(
	createPlaywrightConfig({
		baseURL: "http://localhost:9000",
		command: "cd ../../apps/testing/react && bun run dev",
	}),
);
