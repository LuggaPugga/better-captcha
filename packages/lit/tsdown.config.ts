import { defineConfig } from "tsdown";
import { rollupPlugin } from "./build-plugin.ts";

export default defineConfig({
	entry: ["src/index.ts", "src/base-captcha.ts"],
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
