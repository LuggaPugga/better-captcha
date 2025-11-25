import { defineConfig } from "tsdown";
import { rollupPlugin } from "./build-plugin.ts";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/create-captcha-component.ts",
		"src/composables/use-captcha.ts",
		"!build-plugin.ts",
	],
	platform: "browser",
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	minify: false,
	treeshake: true,
	ignoreWatch: [".turbo"],
	plugins: [rollupPlugin()],
});
