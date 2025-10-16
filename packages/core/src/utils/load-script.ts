export interface LoadScriptOptions {
	callbackName?: string;
	timeout?: number;
	async?: boolean;
	defer?: boolean;
	type?: "module" | "text/javascript";
}

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

export class ScriptLoader {
	private loaded = new Set<string>();
	private pending = new Map<string, Promise<void>>();
	private callbackId = 0;

	generateCallbackName(prefix = "callback"): string {
		return `betterCaptcha_${prefix}_${++this.callbackId}`;
	}

	async loadScript(src: string, options: LoadScriptOptions = {}): Promise<void> {
		if (this.loaded.has(src)) return;

		const pending = this.pending.get(src);
		if (pending) return pending;

		const existingScript = isBrowser && document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
		if (existingScript) {
			this.loaded.add(src);
			return;
		}

		const promise = this.loadScriptInternal(src, options);
		this.pending.set(src, promise);

		try {
			await promise;
			this.loaded.add(src);
		} finally {
			this.pending.delete(src);
		}
	}

	private async loadScriptInternal(src: string, options: LoadScriptOptions): Promise<void> {
		const callbackPromise = this.setupCallback(options.callbackName);
		const scriptPromise = this.createScript(src, options);

		await Promise.all([scriptPromise, callbackPromise].filter(Boolean));
	}

	private setupCallback(callbackName?: string): Promise<void> | null {
		if (!callbackName || !isBrowser) return null;

		return new Promise<void>((resolve) => {
			(window as Record<string, unknown>)[callbackName] = () => resolve();
		});
	}

	private createScript(src: string, options: LoadScriptOptions): Promise<void> {
		if (!isBrowser) {
			return Promise.reject(new Error("Not in browser environment"));
		}

		const script = document.createElement("script");
		script.src = src;
		script.async = options.async ?? true;
		script.defer = options.defer ?? true;
		script.type = options.type ?? "text/javascript";

		return new Promise<void>((resolve, reject) => {
			const timeout = options.timeout ?? 15000;
			const timer = setTimeout(() => {
				script.remove();
				reject(new Error(`Script timeout: ${src}`));
			}, timeout);

			const cleanup = () => clearTimeout(timer);

			script.onload = () => {
				cleanup();
				resolve();
			};

			script.onerror = () => {
				cleanup();
				script.remove();
				reject(new Error(`Failed to load: ${src}`));
			};

			document.head.appendChild(script);
		});
	}
}

export const defaultScriptLoader = new ScriptLoader();
export const loadScript = defaultScriptLoader.loadScript.bind(defaultScriptLoader);
export const generateCallbackName = defaultScriptLoader.generateCallbackName.bind(defaultScriptLoader);
