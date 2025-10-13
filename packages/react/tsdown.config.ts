import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts", "src/base-captcha.tsx", "src/provider/index.ts", "src/provider/*/*.tsx"],
	banner: '"use client";',
	platform: "browser",
	dts: true,
	ignoreWatch: [".turbo"],
	external: [],
	noExternal: ["@react-captcha/core"],
});
