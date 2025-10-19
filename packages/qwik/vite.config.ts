import { qwikVite } from "@builder.io/qwik/optimizer";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { dtsEmitterPlugin, unplugin } from "./build-plugin";
import pkg from "./package.json";

const { dependencies = {}, peerDependencies = {} } = pkg as any;
const makeRegex = (dep) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj) => Object.keys(obj).map(makeRegex);

export default defineConfig(() => {
	return {
		build: {
			outDir: "dist",
			target: "es2020",
			lib: {
				entry: "./src/index.ts",
				formats: ["es", "cjs"],
				fileName: (format, entryName) => `${entryName}.qwik.${format === "es" ? "mjs" : "cjs"}`,
			},
			rollupOptions: {
				output: {
					preserveModules: true,
					preserveModulesRoot: "src",
				},
				// externalize deps that shouldn't be bundled into the library
				external: [/^node:.*/, ...excludeAll(dependencies), ...excludeAll(peerDependencies)],
			},
		},
		plugins: [unplugin.vite(), qwikVite(), dtsEmitterPlugin.vite(), tsconfigPaths({ root: "." })],
	};
});
