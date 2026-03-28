import { qwikVite } from "@builder.io/qwik/optimizer";
import { defineConfig } from "vite";
import { dtsEmitterPlugin, unplugin } from "./build-plugin";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
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
    },
  },
  plugins: [unplugin.vite(), qwikVite(), dtsEmitterPlugin.vite(), viteTsconfigPaths()],
});
