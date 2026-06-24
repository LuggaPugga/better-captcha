import type { ScriptOptions } from "../provider";

export interface LoadScriptOptions {
	callbackName?: string;
	onCallback?: (...args: unknown[]) => void;
	timeout?: number;
	async?: boolean;
	defer?: boolean;
	type?: "module" | "text/javascript";
	nonce?: string;
	integrity?: string;
	crossOrigin?: "" | "anonymous" | "use-credentials" | null;
	referrerPolicy?: HTMLScriptElement["referrerPolicy"];
	fetchPriority?: "high" | "low" | "auto";
	scriptAttributes?: Record<string, string>;
}

export type LoadScriptCallOptions = LoadScriptOptions & {
	scriptOptions?: ScriptOptions;
};

export function scriptOptionsToLoadOptions(scriptOptions?: ScriptOptions): Partial<LoadScriptOptions> {
	if (!scriptOptions) return {};
	const out: Partial<LoadScriptOptions> = {};
	if (scriptOptions.timeout !== undefined) out.timeout = scriptOptions.timeout;
	if (scriptOptions.nonce !== undefined) out.nonce = scriptOptions.nonce;
	if (scriptOptions.integrity !== undefined) out.integrity = scriptOptions.integrity;
	if (scriptOptions.crossOrigin !== undefined) out.crossOrigin = scriptOptions.crossOrigin;
	if (scriptOptions.referrerPolicy !== undefined) out.referrerPolicy = scriptOptions.referrerPolicy;
	if (scriptOptions.fetchPriority !== undefined) out.fetchPriority = scriptOptions.fetchPriority;
	if (scriptOptions.scriptAttributes !== undefined) out.scriptAttributes = scriptOptions.scriptAttributes;
	return out;
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
		if (options.nonce !== undefined) script.nonce = options.nonce;
		if (options.integrity !== undefined) script.integrity = options.integrity;
		if (options.crossOrigin !== undefined) script.crossOrigin = options.crossOrigin;
		if (options.referrerPolicy !== undefined) script.referrerPolicy = options.referrerPolicy;
		if (options.fetchPriority !== undefined) {
			(script as HTMLScriptElement & { fetchPriority?: string }).fetchPriority = options.fetchPriority;
		}
		if (options.scriptAttributes) {
			for (const [name, value] of Object.entries(options.scriptAttributes)) {
				script.setAttribute(name, value);
			}
		}

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

	loadScript(src: string, options: LoadScriptCallOptions = {}): Promise<void> {
		const { scriptOptions: so, ...rest } = options;
		const merged: LoadScriptOptions = { ...scriptOptionsToLoadOptions(so), ...rest };

		if (this.loaded.has(src)) {
			merged.onCallback?.();
			return Promise.resolve();
		}

		const existing = this.pending.get(src);
		if (existing) return this.withCallback(existing, this.setupCallback(merged));

		if (isBrowser && document.querySelector(`script[src="${src}"]`)) {
			this.loaded.add(src);
			merged.onCallback?.();
			return Promise.resolve();
		}

		const finalPromise = this.withCallback(this.createScript(src, merged), this.setupCallback(merged));
		this.pending.set(src, finalPromise);
		finalPromise.finally(() => this.pending.delete(src));

		return finalPromise;
	}
}

export const defaultScriptLoader = new ScriptLoader();
export const loadScript = defaultScriptLoader.loadScript.bind(defaultScriptLoader);
export const generateCallbackName = defaultScriptLoader.generateCallbackName.bind(defaultScriptLoader);
