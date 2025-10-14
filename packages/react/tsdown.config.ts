import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts", "src/base-captcha.tsx", "src/provider/index.ts", "src/provider/*/*.tsx"],
	platform: "browser",
	dts: true,
	ignoreWatch: [".turbo"],
	external: [],
	noExternal: ["@better-captcha/core"],
});
