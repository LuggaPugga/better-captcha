import { defineConfig } from "tsdown";
import { rollupPlugin } from "./build-plugin.ts";

export default defineConfig({
	entry: ["src/index.ts", "src/base-captcha.tsx", "virtual:better-captcha-providers"],
	platform: "browser",
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	minify: false,
	treeshake: true,
	ignoreWatch: [".turbo"],
	external: ["ts-morph"],
	plugins: [rollupPlugin()],
});
