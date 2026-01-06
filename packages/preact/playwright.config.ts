import { createPlaywrightConfig } from "@better-captcha/tests/playwright-config";

export default createPlaywrightConfig({
	baseURL: "http://localhost:9007",
	command: "cd ../../apps/testing/preact && bun run dev",
});
