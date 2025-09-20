const loadedScripts = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();

export function loadScript(
	src: string,
	options?: {
		type?: "module" | "text/javascript";
		async?: boolean;
		defer?: boolean;
		nomodule?: boolean;
	},
): Promise<void> {
	if (loadedScripts.has(src)) {
		return Promise.resolve();
	}

	const existingPromise = loadingPromises.get(src);
	if (existingPromise) {
		return existingPromise;
	}

	const promise = new Promise<void>((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;

		if (options?.type) script.type = options.type;
		if (options?.async) script.async = options.async;
		if (options?.defer) script.defer = options.defer;
		if (options?.nomodule) script.noModule = options.nomodule;

		script.onload = () => {
			loadedScripts.add(src);
			loadingPromises.delete(src);
			resolve();
		};
		script.onerror = () => {
			loadingPromises.delete(src);
			reject();
		};
		document.head.appendChild(script);
	});

	loadingPromises.set(src, promise);
	return promise;
}
