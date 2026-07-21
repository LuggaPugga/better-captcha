import { createPlaywrightConfig } from "@better-captcha/tests/playwright-config";

export default createPlaywrightConfig({
	baseURL: "http://localhost:9000",
	command: "cd ../../apps/testing/react && bun run dev",
});
