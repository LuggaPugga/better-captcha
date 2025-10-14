import { createPlaywrightConfig } from "@better-captcha/tests/playwright-config";

export default createPlaywrightConfig({
	baseURL: "http://localhost:9001",
	command: "cd ../../apps/testing/solid && bun run dev",
});
