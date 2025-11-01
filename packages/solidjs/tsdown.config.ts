import { PROVIDER_REGISTRY } from "@better-captcha/core";
import solid from "rolldown-plugin-solid";
import { defineConfig } from "tsdown";
import unplugin, { dtsEmitterPlugin } from "./build-plugin.ts";

export default defineConfig({
	inputOptions: {
		input: {
			index: "src/index.ts",
			"base-captcha": "src/base-captcha.tsx",
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
	external: (id) => {
		return id === "solid-js" || id.startsWith("@better-captcha/core");
	},
	plugins: [
		unplugin.rolldown(),
		solid({
			solid: { hydratable: false, generate: "dom" },
		}),
		dtsEmitterPlugin.rolldown(),
	],
});
