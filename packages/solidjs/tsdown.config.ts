import { PROVIDER_REGISTRY } from "@better-captcha/core";
import { defineConfig } from "tsdown";
import unplugin, { dtsEmitterPlugin, solidCompilerPlugin } from "./build-plugin.ts";

export default defineConfig({
	inputOptions: {
		input: {
			index: "src/index.ts",
			"base-captcha": "src/base-captcha.tsx",
			"better-captcha": "src/better-captcha.tsx",
			"provider/index": "@better-captcha/solidjs/provider",
			...Object.fromEntries(
				PROVIDER_REGISTRY.map((p) => [`provider/${p.name}/index`, `@better-captcha/solidjs/provider/${p.name}`]),
			),
		},
	},
	platform: "browser",
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	minify: false,
	treeshake: true,
	ignoreWatch: [".turbo"],
	outputOptions: {
		entryFileNames: "[name].js",
		chunkFileNames: "chunks/[name]-[hash].js",
		assetFileNames: "assets/[name][extname]",
		preserveModules: false,
	},
	plugins: [
		unplugin.rolldown(),
		solidCompilerPlugin.rolldown({ generate: "dom", hydratable: false }),
		dtsEmitterPlugin.rolldown(),
	],
});
