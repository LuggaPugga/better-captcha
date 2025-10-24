import { createPlaywrightConfig } from "@better-captcha/tests/playwright-config";

export default createPlaywrightConfig({
	baseURL: "http://localhost:9005",
	command: "cd ../../apps/testing/lit && bun run dev",
});
