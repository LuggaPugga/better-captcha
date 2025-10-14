import { defineConfig } from "tsdown";
import { rollupPlugin } from "./build-plugin.ts";

export default defineConfig({
	entry: ["src/index.ts", "src/base-captcha.tsx", "virtual:better-captcha-providers"],
	platform: "browser",
	dts: true,
	ignoreWatch: [".turbo"],
	external: [],
	noExternal: ["@better-captcha/core"],
	plugins: [rollupPlugin()],
});
