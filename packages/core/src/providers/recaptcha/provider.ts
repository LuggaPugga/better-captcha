import {
	type CaptchaCallbacks,
	type CaptchaHandle,
	Provider,
	type ProviderConfig,
	type ScriptOptions,
} from "../../provider";
import { generateCallbackName, loadScript } from "../../utils/load-script";
import { getSystemTheme } from "../../utils/theme";
import type { ReCaptcha, RenderParameters } from "./types";

declare global {
	interface Window {
		grecaptcha: ReCaptcha.ReCaptcha;
	}
}

const RECAPTCHA_ONLOAD_CALLBACK = generateCallbackName("recaptchaOnload");

export type ReCaptchaHandle = CaptchaHandle;

export class ReCaptchaProvider extends Provider<ProviderConfig, Omit<RenderParameters, "sitekey">, ReCaptchaHandle> {
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
		const scriptUrl = this.buildScriptUrl();

		if (this.config.scriptOptions?.autoLoad !== false) {
			await loadScript(scriptUrl, {
				async: true,
				defer: true,
				callbackName: RECAPTCHA_ONLOAD_CALLBACK,
				timeout: this.config.scriptOptions?.timeout,
			});
		}
	}

	private buildScriptUrl() {
		const url = new URL(this.config.scriptUrl);
		url.searchParams.set("render", "explicit");
		url.searchParams.set("onload", RECAPTCHA_ONLOAD_CALLBACK);
		return url.toString();
	}

	async render(element: HTMLElement, options?: Omit<RenderParameters, "sitekey">, callbacks?: CaptchaCallbacks) {
		const resolvedOptions = options ? { ...options } : undefined;
		if (resolvedOptions?.theme === "auto") {
			resolvedOptions.theme = getSystemTheme();
		}

		const renderOptions: RenderParameters = {
			sitekey: this.identifier,
			...resolvedOptions,
		};

		if (callbacks?.onSolve && !renderOptions.callback) {
			renderOptions.callback = (response: string) => callbacks.onSolve?.(response);
		}
		if (callbacks?.onError && !renderOptions["error-callback"]) {
			renderOptions["error-callback"] = () => callbacks.onError?.("reCAPTCHA error");
		}

		return new Promise<number>((resolve) => {
			window.grecaptcha.ready(() => {
				const widgetId = window.grecaptcha.render(element, renderOptions);
				if (callbacks?.onReady) {
					queueMicrotask(() => callbacks.onReady?.());
				}
				resolve(widgetId);
			});
		});
	}

	reset(widgetId: number) {
		window.grecaptcha.reset(widgetId);
	}

	async execute(widgetId: number) {
		await window.grecaptcha.execute(widgetId);
	}

	destroy(widgetId: number) {
		const element = document.getElementById(`better-captcha-${widgetId}`);
		if (element) {
			window.grecaptcha.reset(widgetId);
			element.innerHTML = "";
		}
	}

	getResponse(widgetId: number): string {
		return window.grecaptcha.getResponse(widgetId);
	}

	getHandle(widgetId: number): ReCaptchaHandle {
		return this.getCommonHandle(widgetId);
	}
}
