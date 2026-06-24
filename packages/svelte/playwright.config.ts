import { createPlaywrightConfig } from "@better-captcha/tests/playwright-config";

const config = createPlaywrightConfig({
	baseURL: "http://localhost:9004",
	command: "cd ../../apps/testing/svelte && bun run dev",
});

config.projects = (config.projects ?? []).flatMap((project) => [
	{
		...project,
		name: `${project.name}-dedicated`,
		metadata: { ...project.metadata, componentMode: "dedicated" },
	},
	{
		...project,
		name: `${project.name}-dynamic`,
		metadata: { ...project.metadata, componentMode: "dynamic" },
	},
]);

export default config;
