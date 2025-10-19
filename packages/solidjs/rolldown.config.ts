import { PROVIDER_REGISTRY } from "@better-captcha/core";
import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";
import solid from "rolldown-plugin-solid";
import unplugin, { dtsEmitterPlugin } from "./build-plugin.ts";

const config = defineConfig({
	input: {
		index: "src/index.ts",
		"base-captcha": "src/base-captcha.tsx",
		"provider/index": "@better-captcha/solidjs/provider",
		...Object.fromEntries(
			PROVIDER_REGISTRY.map((p) => [`provider/${p.name}/index`, `@better-captcha/solidjs/provider/${p.name}`]),
		),
	},
	plugins: [
		unplugin.rolldown(),
		solid({
			solid: { hydratable: false, generate: "dom" },
		}),
		dts(),
		dtsEmitterPlugin.rolldown(),
	],
	output: {
		dir: "dist",
		format: "esm",
		sourcemap: true,
		entryFileNames: "[name].js",
		chunkFileNames: "chunks/[name]-[hash].js",
		assetFileNames: "assets/[name][extname]",
		preserveModules: false,
	},
	external: (id) => {
		return id === "solid-js" || id.startsWith("@better-captcha/core");
	},
});

export default config;
