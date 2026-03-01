import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [fresh(), tailwindcss()],
	resolve: {
		alias: {
			fresh: "jsr:@fresh/core@^2.2.0",
		},
	},
});
