export interface LoadScriptOptions {
	callbackName?: string;
	onCallback?: (...args: unknown[]) => void;
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

	generateCallbackName(prefix = "callback") {
		return `betterCaptcha_${prefix}_${++this.callbackId}`;
	}

	private setupCallback(options: LoadScriptOptions): Promise<void> | null {
		const { callbackName, onCallback } = options;
		if (!callbackName || !isBrowser) return null;

		const win = window as Record<string, unknown>;
		const prev = win[callbackName];

		return new Promise<void>((resolve) => {
			win[callbackName] = (...args: unknown[]) => {
				typeof prev === "function" && prev(...args);
				onCallback?.(...args);
				win[callbackName] = prev;
				resolve();
			};
		});
	}

	private createScript(src: string, options: LoadScriptOptions): Promise<void> {
		if (!isBrowser) return Promise.reject(new Error("Not in browser environment"));

		const script = document.createElement("script");
		Object.assign(script, {
			src,
			async: options.async ?? true,
			defer: options.defer ?? false,
			type: options.type ?? "text/javascript",
		});

		return new Promise<void>((resolve, reject) => {
			const timer = setTimeout(() => {
				script.remove();
				reject(new Error(`Script timeout: ${src}`));
			}, options.timeout ?? 15000);

			script.onload = () => {
				clearTimeout(timer);
				this.loaded.add(src);
				resolve();
			};

			script.onerror = () => {
				clearTimeout(timer);
				script.remove();
				reject(new Error(`Failed to load: ${src}`));
			};

			document.head.appendChild(script);
		});
	}

	private withCallback(promise: Promise<void>, callback: Promise<void> | null): Promise<void> {
		return callback ? Promise.all([promise, callback]).then(() => undefined) : promise;
	}

	loadScript(src: string, options: LoadScriptOptions = {}): Promise<void> {
		if (this.loaded.has(src) || (isBrowser && document.querySelector(`script[src="${src}"]`))) {
			if (!this.loaded.has(src)) this.loaded.add(src);
			options.onCallback?.();
			return Promise.resolve();
		}

		const existing = this.pending.get(src);
		if (existing) return this.withCallback(existing, this.setupCallback(options));

		const finalPromise = this.withCallback(this.createScript(src, options), this.setupCallback(options));
		this.pending.set(src, finalPromise);
		finalPromise.finally(() => this.pending.delete(src));

		return finalPromise;
	}
}

export const defaultScriptLoader = new ScriptLoader();
export const loadScript = defaultScriptLoader.loadScript.bind(defaultScriptLoader);
export const generateCallbackName = defaultScriptLoader.generateCallbackName.bind(defaultScriptLoader);
