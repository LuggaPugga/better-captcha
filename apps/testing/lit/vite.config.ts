import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 9005,
	},
	build: {
		target: "esnext",
	},
});
