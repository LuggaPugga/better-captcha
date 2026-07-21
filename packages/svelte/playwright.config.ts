import { createPlaywrightConfig, withComponentModes } from "@better-captcha/tests/playwright-config";

export default withComponentModes(createPlaywrightConfig({
	baseURL: "http://localhost:9004",
	command: "cd ../../apps/testing/svelte && bun run dev",
}));
