const SCRIPT_MARK = "data-react-captcha-loader";

export interface LoadScriptOptions {
	type?: "module" | "text/javascript";
	async?: boolean;
	defer?: boolean;
	nomodule?: boolean;
	callbackName?: string;
	callbackNamespace?: Record<string, unknown>;
	keepCallback?: boolean;
	onCallback?: (...args: unknown[]) => void;
	timeout?: number;
	signal?: AbortSignal;
	forceReload?: boolean;
}

type CallbackLifecycle = "executed" | "cached";

const isBrowserEnv = () =>
	typeof window !== "undefined" && typeof document !== "undefined";

export class ScriptLoader {
	private loadedScripts = new Set<string>();
	private pendingScripts = new Map<string, Promise<void>>();
	private callbackSequence = 0;

	generateCallbackName(prefix = "callback") {
		this.callbackSequence += 1;
		return `reactCaptcha_${prefix}_${this.callbackSequence}`;
	}

	private normalizeSrc(src: string): string {
		if (!isBrowserEnv()) return src;
		try {
			return new URL(src, window.location.href).href;
		} catch {
			return src;
		}
	}

	private isScriptReady(script: HTMLScriptElement) {
		return script.getAttribute(SCRIPT_MARK) === "loaded";
	}

	private findScript(normalizedSrc: string) {
		if (!isBrowserEnv()) return null;
		return (
			Array.from(document.getElementsByTagName("script")).find((script) => {
				try {
					return (
						new URL(script.src, window.location.href).href === normalizedSrc
					);
				} catch {
					return script.src === normalizedSrc;
				}
			}) ?? null
		);
	}

	private markScriptLoaded(script: HTMLScriptElement, src: string) {
		script.setAttribute(SCRIPT_MARK, "loaded");
		this.loadedScripts.add(src);
	}

	private emitCallbackSideEffects(
		options: LoadScriptOptions,
		args: unknown[],
		reason: CallbackLifecycle,
	) {
		const { callbackName, onCallback } = options;
		if (typeof onCallback === "function") {
			try {
				onCallback(...args);
			} catch (err) {
				console.error("[react-captcha] onCallback failed:", err);
			}
		}
		if (callbackName) {
			console.info(
				`[react-captcha] Callback "${callbackName}" ${
					reason === "cached" ? "already executed (cached)" : "executed"
				}.`,
			);
		}
	}

	private createCallbackPromise(
		options: LoadScriptOptions,
	): Promise<void> | null {
		const { callbackName, callbackNamespace, keepCallback } = options;
		if (!callbackName || !isBrowserEnv()) return null;
		const target = (callbackNamespace ?? window) as Record<string, unknown>;
		const previous = target[callbackName];
		if (previous && typeof previous !== "function") {
			console.warn(
				`[react-captcha] callbackNamespace already has a non-function property '${callbackName}'.`,
			);
			return Promise.resolve();
		}
		let settled = false;
		return new Promise<void>((resolve) => {
			const wrapped = (...args: unknown[]) => {
				if (typeof previous === "function") previous(...args);
				this.emitCallbackSideEffects(options, args, "executed");
				if (settled) return;
				settled = true;
				if (!keepCallback) {
					if (previous === undefined) delete target[callbackName];
					else target[callbackName] = previous;
				}
				resolve();
			};
			target[callbackName] = wrapped as unknown;
		});
	}

	private listenToExistingScript(
		script: HTMLScriptElement,
		normalizedSrc: string,
	): Promise<void> {
		if (
			script.getAttribute(SCRIPT_MARK) === "loaded" ||
			this.isScriptReady(script)
		) {
			this.markScriptLoaded(script, normalizedSrc);
			return Promise.resolve();
		}
		return new Promise<void>((resolve, reject) => {
			const cleanup = () => {
				script.removeEventListener("load", onLoad);
				script.removeEventListener("error", onError);
			};
			const onLoad = () => {
				cleanup();
				this.markScriptLoaded(script, normalizedSrc);
				resolve();
			};
			const onError = () => {
				cleanup();
				reject(
					new Error(`Failed to load script: ${script.src || normalizedSrc}`),
				);
			};
			script.addEventListener("load", onLoad, { once: true });
			script.addEventListener("error", onError, { once: true });
			if (this.isScriptReady(script)) onLoad();
		});
	}

	private appendScript(
		src: string,
		normalizedSrc: string,
		opts: LoadScriptOptions,
	): Promise<void> {
		if (!isBrowserEnv()) {
			return Promise.reject(
				new Error("Cannot load script outside the browser environment."),
			);
		}
		const script = document.createElement("script");
		script.setAttribute(SCRIPT_MARK, "pending");
		script.src = src;
		if (opts.type) script.type = opts.type;
		if (typeof opts.async === "boolean") script.async = opts.async;
		if (typeof opts.defer === "boolean") script.defer = opts.defer;
		if (typeof opts.nomodule === "boolean") script.noModule = opts.nomodule;
		return new Promise<void>((resolve, reject) => {
			let timeoutId: number | undefined;
			const cleanup = () => {
				clearTimeout(timeoutId);
				script.removeEventListener("load", onLoad);
				script.removeEventListener("error", onError);
				opts.signal?.removeEventListener("abort", onAbort);
			};
			const onLoad = () => {
				cleanup();
				this.markScriptLoaded(script, normalizedSrc);
				resolve();
			};
			const onError = () => {
				cleanup();
				script.remove();
				reject(new Error(`Failed to load script: ${src}`));
			};
			const onAbort = () => {
				cleanup();
				script.remove();
				reject(new Error("Script load aborted."));
			};
			opts.signal?.addEventListener("abort", onAbort, { once: true });
			const timeout = opts.timeout ?? 15000;
			if (timeout > 0) {
				timeoutId = window.setTimeout(() => {
					cleanup();
					script.remove();
					reject(new Error(`Script load timed out after ${timeout}ms: ${src}`));
				}, timeout);
			}
			script.addEventListener("load", onLoad, { once: true });
			script.addEventListener("error", onError, { once: true });
			document.head.appendChild(script);
		});
	}

	loadScript(src: string, options: LoadScriptOptions = {}): Promise<void> {
		const normalizedSrc = this.normalizeSrc(src);
		if (options.forceReload && isBrowserEnv()) {
			const existing = this.findScript(normalizedSrc);
			existing?.remove();
			this.loadedScripts.delete(normalizedSrc);
		}
		if (this.loadedScripts.has(normalizedSrc)) {
			this.emitCallbackSideEffects(options, [], "cached");
			return Promise.resolve();
		}
		const callbackPromise = this.createCallbackPromise(options);
		const existingPromise = this.pendingScripts.get(normalizedSrc);
		if (existingPromise) {
			return callbackPromise
				? Promise.all([existingPromise, callbackPromise]).then(() => {})
				: existingPromise;
		}
		const existingScript = this.findScript(normalizedSrc);
		const loadPromise = existingScript
			? this.listenToExistingScript(existingScript, normalizedSrc)
			: this.appendScript(src, normalizedSrc, options);
		const finalPromise = callbackPromise
			? Promise.all([loadPromise, callbackPromise]).then(() => {})
			: loadPromise;
		this.pendingScripts.set(
			normalizedSrc,
			finalPromise.finally(() => {
				this.pendingScripts.delete(normalizedSrc);
			}),
		);
		return finalPromise;
	}
}

export const defaultScriptLoader = new ScriptLoader();
export const loadScript =
	defaultScriptLoader.loadScript.bind(defaultScriptLoader);
export const generateCallbackName =
	defaultScriptLoader.generateCallbackName.bind(defaultScriptLoader);
