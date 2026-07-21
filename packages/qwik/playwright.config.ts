import { createPlaywrightConfig } from "@better-captcha/tests/playwright-config";

export default createPlaywrightConfig({
	baseURL: "http://localhost:9003",
	command: "cd ../../apps/testing/qwik && bun run dev",
});
