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

	private findScript(src: string): HTMLScriptElement | null {
		if (!isBrowser) return null;
		return document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
	}

	private setupCallback(options: LoadScriptOptions): Promise<void> | null {
		const { callbackName, onCallback } = options;
		if (!callbackName || !isBrowser) return null;

		const win = window as unknown as Record<string, unknown>;
		const prev = win[callbackName];

		return new Promise<void>((resolve) => {
			win[callbackName] = (...args: unknown[]) => {
				if (typeof prev === "function") prev(...args);
				onCallback?.(...args);
				win[callbackName] = prev;
				resolve();
			};
		});
	}

	private createScript(src: string, options: LoadScriptOptions): Promise<void> {
		if (!isBrowser) {
			return Promise.reject(new Error("Not in browser environment"));
		}

		const script = document.createElement("script");
		script.src = src;
		script.async = options.async ?? true;
		script.defer = options.defer ?? false;
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
				this.loaded.add(src);
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

	loadScript(src: string, options: LoadScriptOptions = {}): Promise<void> {
		if (this.loaded.has(src)) {
			options.onCallback?.();
			return Promise.resolve();
		}

		const callbackPromise = this.setupCallback(options);

		const existing = this.pending.get(src);
		if (existing) {
			return callbackPromise ? Promise.all([existing, callbackPromise]).then(() => {}) : existing;
		}

		const existingScript = this.findScript(src);
		if (existingScript) {
			this.loaded.add(src);
			options.onCallback?.();
			return Promise.resolve();
		}

		const loadPromise = this.createScript(src, options);
		const finalPromise = callbackPromise ? Promise.all([loadPromise, callbackPromise]).then(() => {}) : loadPromise;

		this.pending.set(src, finalPromise);
		finalPromise.finally(() => this.pending.delete(src));

		return finalPromise;
	}
}

export const defaultScriptLoader = new ScriptLoader();
export const loadScript = defaultScriptLoader.loadScript.bind(defaultScriptLoader);
export const generateCallbackName = defaultScriptLoader.generateCallbackName.bind(defaultScriptLoader);
