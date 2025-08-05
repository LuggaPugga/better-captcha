const loadedScripts = new Set<string>();

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

	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;

		if (options?.type) script.type = options.type;
		if (options?.async) script.async = options.async;
		if (options?.defer) script.defer = options.defer;
		if (options?.nomodule) script.noModule = options.nomodule;

		script.onload = () => {
			loadedScripts.add(src);
			resolve();
		};
		script.onerror = () => reject();
		document.head.appendChild(script);
	});
}
