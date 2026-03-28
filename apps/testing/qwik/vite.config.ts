/**
 * This is the base config for vite.
 * When building, the adapter config is used which loads this file and extends it.
 */

import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { defineConfig } from "vite";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [qwikCity(), qwikVite()],
});
