import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		react(),
		{
			name: "watch-workspace-package",
			configureServer(server) {
				server.watcher.add(path.resolve(import.meta.dirname, "../../packages/react"));
			},
		},
	],
	server: {
		port: 9000,
	},
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
});
