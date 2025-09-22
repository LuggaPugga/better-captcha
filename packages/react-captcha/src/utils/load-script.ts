const SCRIPT_MARK = "data-react-captcha-loader";

const loadedScripts = new Set<string>();
const pendingScripts = new Map<string, Promise<void>>();
const callbackRegistry = new Map<string, CallbackHandle>();
const scriptCallbackNames = new Map<string, string>();

let callbackSequence = 0;

const noop = () => {};

interface ScriptWithReadyState extends HTMLScriptElement {
	readyState?: string;
}

export interface LoadScriptOptions {
	type?: "module" | "text/javascript";
	async?: boolean;
	defer?: boolean;
	nomodule?: boolean;
	callbackName?: string;
	callbackNamespace?: Record<string, unknown>;
	keepCallback?: boolean;
	callbackResolveCondition?: () => boolean;
}

interface CallbackHandle {
	name: string;
	promise: Promise<void>;
	cleanup: () => void;
}

interface ScriptCallbackHandle {
	promise: Promise<void>;
	cleanup: () => void;
}

const isBrowser = () => typeof window !== "undefined";
const hasDocument = () => typeof document !== "undefined";

const isScriptMarkedLoaded = (script: HTMLScriptElement) =>
	script.getAttribute(SCRIPT_MARK) === "loaded";

const isScriptReady = (script: HTMLScriptElement) => {
	const state = (script as ScriptWithReadyState).readyState;
	return state === "complete" || state === "loaded";
};

function markScriptLoaded(script: HTMLScriptElement, normalizedSrc: string) {
	script.setAttribute(SCRIPT_MARK, "loaded");
	loadedScripts.add(normalizedSrc);
}

export function generateCallbackName(prefix = "callback") {
	callbackSequence += 1;
	return `reactCaptcha_${prefix}_${callbackSequence}`;
}

function normalizeScriptSrc(src: string) {
	if (!isBrowser()) {
		return src;
	}

	try {
		return new URL(src, window.location.href).href;
	} catch {
		return src;
	}
}

function findScript(normalizedSrc: string) {
	if (!hasDocument()) {
		return null;
	}

	return (
		Array.from(document.getElementsByTagName("script")).find((script) => {
			try {
				return new URL(script.src, window.location.href).href === normalizedSrc;
			} catch {
				return script.src === normalizedSrc;
			}
		}) ?? null
	);
}

function resolvedCallbackHandle(name: string): CallbackHandle {
	return {
		name,
		promise: Promise.resolve(),
		cleanup: noop,
	};
}

function registerCallback(options: {
	name: string;
	namespace?: Record<string, unknown>;
	keepCallback?: boolean;
	resolveCondition?: () => boolean;
}): CallbackHandle {
	const { name, namespace, keepCallback = false, resolveCondition } = options;

	if (callbackRegistry.has(name)) {
		return callbackRegistry.get(name)!;
	}

	if (resolveCondition?.()) {
		return resolvedCallbackHandle(name);
	}

	if (!isBrowser()) {
		return resolvedCallbackHandle(name);
	}

	const target = namespace ?? window;
	if (!target) {
		return resolvedCallbackHandle(name);
	}

	const container = target as Record<string, unknown>;
	const previous = container[name];
	let settled = false;

	const restore = () => {
		if (previous === undefined) {
			delete container[name];
		} else {
			container[name] = previous;
		}
	};

	const promise = new Promise<void>((resolve) => {
		const wrapped = (...args: unknown[]) => {
			if (typeof previous === "function") {
				(previous as (...callbackArgs: unknown[]) => void)(...args);
			}

			if (settled) return;

			settled = true;
			callbackRegistry.delete(name);
			if (!keepCallback) {
				restore();
			}
			resolve();
		};

		container[name] = wrapped as unknown;
	});

	const cleanup = () => {
		if (settled) return;
		settled = true;
		callbackRegistry.delete(name);
		if (!keepCallback) {
			restore();
		}
	};

	const handle: CallbackHandle = { name, promise, cleanup };
	callbackRegistry.set(name, handle);
	return handle;
}

function watchCondition(check?: () => boolean): ScriptCallbackHandle | null {
	if (!check) {
		return null;
	}

	if (!isBrowser()) {
		return {
			promise: Promise.resolve(),
			cleanup: noop,
		};
	}

	if (check()) {
		return {
			promise: Promise.resolve(),
			cleanup: noop,
		};
	}

	let timer: number | null = null;

	const promise = new Promise<void>((resolve) => {
		const evaluate = () => {
			if (check()) {
				if (timer !== null) {
					window.clearTimeout(timer);
					timer = null;
				}
				resolve();
				return;
			}

			timer = window.setTimeout(evaluate, 50);
		};

		timer = window.setTimeout(evaluate, 0);
	});

	return {
		promise,
		cleanup: () => {
			if (timer !== null) {
				window.clearTimeout(timer);
				timer = null;
			}
		},
	};
}

function attachScriptCallback(
	normalizedSrc: string,
	options: LoadScriptOptions,
): ScriptCallbackHandle | null {
	const existingName = scriptCallbackNames.get(normalizedSrc);
	const effectiveName = existingName ?? options.callbackName;

	if (!effectiveName) {
		return watchCondition(options.callbackResolveCondition);
	}

	const handle = registerCallback({
		name: effectiveName,
		namespace: options.callbackNamespace,
		keepCallback: options.keepCallback,
		resolveCondition: options.callbackResolveCondition,
	});

	if (!existingName) {
		scriptCallbackNames.set(normalizedSrc, effectiveName);
	}

	const cleanupMapping = () => {
		if (scriptCallbackNames.get(normalizedSrc) === effectiveName) {
			scriptCallbackNames.delete(normalizedSrc);
		}
	};

	handle.promise.finally(cleanupMapping).catch(noop);

	return {
		promise: handle.promise,
		cleanup: () => {
			cleanupMapping();
			handle.cleanup();
		},
	};
}

function combinePromises(
	loadPromise?: Promise<void> | null,
	callbackPromise?: Promise<void> | null,
) {
	if (loadPromise && callbackPromise) {
		return Promise.all([loadPromise, callbackPromise]).then(() => {});
	}

	if (loadPromise) return loadPromise;
	if (callbackPromise) return callbackPromise;

	return Promise.resolve();
}

function listenToExistingScript(
	script: HTMLScriptElement,
	normalizedSrc: string,
	onError?: () => void,
) {
	if (isScriptMarkedLoaded(script) || isScriptReady(script)) {
		markScriptLoaded(script, normalizedSrc);
		return Promise.resolve();
	}

	return new Promise<void>((resolve, reject) => {
		const handleLoad = () => {
			cleanup();
			markScriptLoaded(script, normalizedSrc);
			resolve();
		};

		const handleError = () => {
			cleanup();
			onError?.();
			reject(new Error(`Failed to load script: ${script.src || normalizedSrc}`));
		};

		const cleanup = () => {
			script.removeEventListener("load", handleLoad);
			script.removeEventListener("error", handleError);
		};

		script.addEventListener("load", handleLoad, { once: true });
		script.addEventListener("error", handleError, { once: true });

		if (isScriptReady(script)) {
			handleLoad();
		}
	});
}

function appendScript(
	src: string,
	normalizedSrc: string,
	opts: LoadScriptOptions,
	onError?: () => void,
) {
	if (!hasDocument()) {
		onError?.();
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

	const promise = new Promise<void>((resolve, reject) => {
		const handleLoad = () => {
			cleanup();
			markScriptLoaded(script, normalizedSrc);
			resolve();
		};

		const handleError = () => {
			cleanup();
			script.remove();
			onError?.();
			reject(new Error(`Failed to load script: ${src}`));
		};

		const cleanup = () => {
			script.removeEventListener("load", handleLoad);
			script.removeEventListener("error", handleError);
		};

		script.addEventListener("load", handleLoad, { once: true });
		script.addEventListener("error", handleError, { once: true });

		document.head.appendChild(script);
	});

	return promise;
}

export function loadScript(src: string, options: LoadScriptOptions = {}) {
	const normalizedSrc = normalizeScriptSrc(src);
	const callbackHandle = attachScriptCallback(normalizedSrc, options);
	const callbackPromise = callbackHandle?.promise ?? null;

	if (loadedScripts.has(normalizedSrc)) {
		return combinePromises(null, callbackPromise);
	}

	const existingPromise = pendingScripts.get(normalizedSrc);
	if (existingPromise) {
		return combinePromises(existingPromise, callbackPromise);
	}

	const existingScript = findScript(normalizedSrc);
	const loadPromise = existingScript
		? listenToExistingScript(existingScript, normalizedSrc, callbackHandle?.cleanup)
		: appendScript(src, normalizedSrc, options, callbackHandle?.cleanup);

	const finalPromise = combinePromises(loadPromise, callbackPromise)
		.finally(() => {
			pendingScripts.delete(normalizedSrc);
		});

	pendingScripts.set(normalizedSrc, finalPromise);
	return finalPromise;
}
