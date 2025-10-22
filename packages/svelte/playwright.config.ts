import { createPlaywrightConfig } from "@better-captcha/tests/playwright-config";

export default createPlaywrightConfig({
	baseURL: "http://localhost:9004",
	command: "cd ../../apps/testing/svelte && npm run dev",
});
