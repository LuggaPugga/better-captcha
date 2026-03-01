import { defineConfig } from "tsdown";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/errors.ts",
		"src/providers/turnstile.ts",
		"src/providers/recaptcha.ts",
		"src/providers/hcaptcha.ts",
		"src/providers/friendly-captcha.ts",
		"src/providers/recaptcha-compatible.ts",
		"src/providers/captcha-fox.ts",
		"src/providers/private-captcha.ts",
		"src/providers/prosopo.ts",
	],
	platform: "node",
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: false,
	minify: false,
	treeshake: true,
	ignoreWatch: [".turbo"],
});
