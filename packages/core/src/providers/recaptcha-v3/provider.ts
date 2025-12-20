import {
	type CaptchaCallbacks,
	type CaptchaHandle,
	Provider,
	type ProviderConfig,
	type ScriptOptions,
} from "../../provider";
import { loadScript } from "../../utils/load-script";
import type { ReCaptcha } from "../recaptcha/types";
import type { RenderParameters } from "./types";

declare global {
	interface Window {
		grecaptcha: ReCaptcha.ReCaptcha;
	}
}

export type ReCaptchaV3Handle = CaptchaHandle;

interface TokenCache {
	token: string;
	timestamp: number;
}

export class ReCaptchaV3Provider extends Provider<ProviderConfig, RenderParameters, ReCaptchaV3Handle> {
	private tokenCache = new Map<string, TokenCache>();
	private readonly TOKEN_CACHE_DURATION = 2 * 60 * 1000;

	constructor(sitekey: string, scriptOptions?: ScriptOptions) {
		super(
			{
				scriptUrl: "https://www.google.com/recaptcha/api.js",
				scriptOptions,
			},
			sitekey,
		);
	}

	async init() {
		const scriptUrl = this.config.scriptOptions?.overrideScriptUrl ?? this.buildScriptUrl();

		if (this.config.scriptOptions?.autoLoad !== false) {
			await loadScript(scriptUrl, {
				async: true,
				defer: true,
				timeout: this.config.scriptOptions?.timeout,
			});
		}
	}

	private buildScriptUrl() {
		const url = new URL(this.config.scriptUrl);
		url.searchParams.set("render", this.identifier);
		return url.toString();
	}

	async render(_element: HTMLElement, options?: RenderParameters, callbacks?: CaptchaCallbacks): Promise<string> {
		if (!options?.action) {
			throw new Error("reCAPTCHA v3 requires an 'action' parameter");
		}

		const cacheKey = options.action;
		const cached = this.tokenCache.get(cacheKey);
		const now = Date.now();

		if (cached && now - cached.timestamp < this.TOKEN_CACHE_DURATION) {
			if (callbacks?.onSolve) {
				queueMicrotask(() => callbacks.onSolve?.(cached.token));
			}
			return cacheKey;
		}

		return new Promise<string>((resolve, reject) => {
			window.grecaptcha.ready(async () => {
				try {
					const token = await window.grecaptcha.execute(this.identifier, {
						action: options.action,
					});

					this.tokenCache.set(cacheKey, {
						token,
						timestamp: now,
					});

					if (callbacks?.onReady) {
						queueMicrotask(() => callbacks.onReady?.());
					}
					if (callbacks?.onSolve) {
						queueMicrotask(() => callbacks.onSolve?.(token));
					}

					resolve(cacheKey);
				} catch (error) {
					const errorMessage = error instanceof Error ? error : "reCAPTCHA v3 execution failed";
					if (callbacks?.onError) {
						callbacks.onError(errorMessage);
					}
					reject(error);
				}
			});
		});
	}

	reset(widgetId: string) {
		this.tokenCache.delete(widgetId);
	}

	async execute(widgetId: string): Promise<void> {
		const action = widgetId;
		const token = await window.grecaptcha.execute(this.identifier, {
			action,
		});

		this.tokenCache.set(widgetId, {
			token,
			timestamp: Date.now(),
		});
	}

	destroy(widgetId: string) {
		this.tokenCache.delete(widgetId);
	}

	getResponse(widgetId: string): string {
		const cached = this.tokenCache.get(widgetId);
		return cached?.token ?? "";
	}

	getHandle(widgetId: string): ReCaptchaV3Handle {
		return this.getCommonHandle(widgetId);
	}
}
