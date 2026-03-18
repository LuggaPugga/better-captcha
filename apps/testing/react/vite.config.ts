import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		react(),
		{
			name: "watch-workspace-package",
			configureServer(server) {
				server.watcher.add(path.resolve(__dirname, "../../packages/react"));
			},
		},
	],
	server: {
		port: 9000,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
