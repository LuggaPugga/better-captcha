import { createPlaywrightConfig, withComponentModes } from "@better-captcha/tests/playwright-config";

export default withComponentModes(createPlaywrightConfig({
	baseURL: "http://localhost:9002",
	command: "cd ../../apps/testing/vue && bun run dev",
}));
