import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid()],
	server: {
		port: 9001,
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
		},
	},
});
