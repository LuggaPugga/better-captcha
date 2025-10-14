import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import process from "node:process";
import type { FSWatcher } from "chokidar";
import chokidar from "chokidar";

const PACKAGE_NAME = "@better-captcha/react";
const packageRoot = process.cwd();
const outputDir = join(packageRoot, "src/provider");
const coreSrcDir = resolve(packageRoot, "../core/src");
const watchPatterns = [resolve(coreSrcDir, "registry.ts"), resolve(coreSrcDir, "providers/**/*")];

let watcher: FSWatcher | null = null;
let shuttingDown = false;
let generatorDebounce: NodeJS.Timeout | undefined;

const cleanup = () => {
	try {
		rmSync(outputDir, { recursive: true, force: true });
	} catch (error) {
		if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") {
			console.error(`[${PACKAGE_NAME}] Failed to clean generated providers`, error);
		}
	}
};

const runGenerator = async (reason: string) => {
	console.log(`\n[${PACKAGE_NAME}] Generating provider components (${reason})`);
	cleanup();

	const generator = spawn("bun", ["run", "scripts/generate-components.ts"], {
		cwd: packageRoot,
		stdio: "inherit",
	});

	return new Promise<void>((resolve, reject) => {
		generator.on("error", reject);
		generator.on("exit", (code, signal) => {
			if (code === 0) resolve();
			else {
				const detail = typeof code === "number" ? `exit code ${code}` : signal ? `signal ${signal}` : "unknown";
				reject(new Error(`generator stopped (${detail})`));
			}
		});
	});
};

const scheduleGeneration = (reason: string) => {
	clearTimeout(generatorDebounce);
	generatorDebounce = setTimeout(() => {
		void runGenerator(reason).catch((error) => {
			console.error(`[${PACKAGE_NAME}] Provider generation failed`, error);
		});
	}, 150);
};

const spawnBuildProcess = () => {
    const build = spawn("bun", ["run", "build:watch"], {
		cwd: packageRoot,
		stdio: "inherit",
	});

	build.on("error", (error) => {
		console.error(`[${PACKAGE_NAME}] Build process failed`, error);
		shutdown(1);
	});

	build.on("exit", (code, signal) => {
		if (shuttingDown) return;
		const detail = typeof code === "number" ? `exit code ${code}` : signal ? `signal ${signal}` : "unknown";
		console.error(`[${PACKAGE_NAME}] Build process exited unexpectedly (${detail})`);
		shutdown(typeof code === "number" ? code : 1);
	});

	return build;
};

const shutdown = async (exitCode: number) => {
	if (shuttingDown) return;
	shuttingDown = true;

	if (watcher) await watcher.close();
	cleanup();
	process.exit(exitCode);
};

const handleSignal = (signal: NodeJS.Signals) => {
	console.log(`\n[${PACKAGE_NAME}] Received ${signal}. Shutting down...`);
	void shutdown(0);
};

process.on("SIGINT", handleSignal);
process.on("SIGTERM", handleSignal);
process.on("uncaughtException", (error) => {
	console.error(`[${PACKAGE_NAME}] Uncaught exception`, error);
	void shutdown(1);
});
process.on("unhandledRejection", (reason) => {
	console.error(`[${PACKAGE_NAME}] Unhandled rejection`, reason);
	void shutdown(1);
});
process.on("exit", cleanup);

try {
	await runGenerator("initial run");
} catch (error) {
	console.error(`[${PACKAGE_NAME}] Initial generation failed`, error);
	process.exit(1);
}

const buildProcess = spawnBuildProcess();

watcher = chokidar.watch(watchPatterns, { ignoreInitial: true });
watcher.on("all", (event, path) => {
	const relativePath = relative(coreSrcDir, path.toString());
	scheduleGeneration(`${event} ${relativePath}`);
});

console.log(`[${PACKAGE_NAME}] Watching provider definitions for changes...`);

await new Promise<void>((resolve) => {
	buildProcess.on("exit", resolve);
});
