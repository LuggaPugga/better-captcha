import { qwikVite } from "@builder.io/qwik/optimizer";
import { defineConfig } from "vite";
import { dtsEmitterPlugin, unplugin } from "./build-plugin";
import pkg from "./package.json";

const { dependencies = {}, peerDependencies = {} } = pkg;

function makeDepRegex(dep: string) {
  return new RegExp(`^${dep}(\\/.*)?$`);
}

function allDepRegexes(obj: Record<string, string>) {
  return Object.keys(obj).map(makeDepRegex);
}

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: "dist",
    target: "es2020",
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.qwik.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
      },
      external: [
        /^node:.*/,
        ...allDepRegexes(dependencies),
        ...allDepRegexes(peerDependencies),
      ],
    },
  },
  plugins: [unplugin.vite(), qwikVite(), dtsEmitterPlugin.vite()],
});
