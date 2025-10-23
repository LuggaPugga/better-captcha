import { defineConfig } from "tsdown";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/provider.ts",
		"src/utils/load-script.ts",
		"src/utils/theme.ts",
		"src/utils/build-plugin-utils.ts",
		"src/providers/*/index.ts",
	],
	platform: "browser",
	format: "esm",
	dts: true,
	outDir: "./dist",
	ignoreWatch: [".turbo"],
});
