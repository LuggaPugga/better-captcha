import { defineConfig } from "tsdown";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/base-captcha.tsx",
		"src/provider.ts",
		"src/utils/load-script.ts",
		"src/provider/*/index.ts",
	],
	banner: '"use client";',
	platform: "browser",
	dts: true,
});
