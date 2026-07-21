import { createPlaywrightConfig, withComponentModes } from "@better-captcha/tests/playwright-config";

export default withComponentModes(createPlaywrightConfig({
	baseURL: "http://localhost:9003",
	command: "cd ../../apps/testing/qwik && bun run dev",
}));
