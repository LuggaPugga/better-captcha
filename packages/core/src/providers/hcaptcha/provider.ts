import { type CaptchaCallbacks, type CaptchaHandle, Provider, type ProviderConfig } from "../../provider";
import { generateCallbackName, loadScript } from "../../utils/load-script";
import { getSystemTheme } from "../../utils/theme";
import type { HCaptcha, RenderParameters } from "./types";

declare global {
	interface Window {
		hcaptcha: HCaptcha.HCaptcha;
	}
}

const HCAPTCHA_ONLOAD_CALLBACK = generateCallbackName("hcaptchaOnload");

export type HCaptchaHandle = CaptchaHandle;

export class HCaptchaProvider extends Provider<ProviderConfig, RenderParameters, HCaptchaHandle> {
	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://js.hcaptcha.com/1/api.js",
			},
			sitekey,
		);
	}

	async init() {
		const scriptUrl = this.buildScriptUrl();

		await loadScript(scriptUrl, {
			async: true,
			defer: true,
			callbackName: HCAPTCHA_ONLOAD_CALLBACK,
		});
	}

	private buildScriptUrl() {
		const url = new URL(this.config.scriptUrl);
		url.searchParams.set("render", "explicit");
		url.searchParams.set("recaptchacompat", "off");
		url.searchParams.set("onload", HCAPTCHA_ONLOAD_CALLBACK);
		return url.toString();
	}

	render(element: HTMLElement, options?: RenderParameters, callbacks?: CaptchaCallbacks) {
		const resolvedOptions = options ? { ...options } : undefined;
		if (resolvedOptions?.theme === "auto") {
			resolvedOptions.theme = getSystemTheme();
		}
		
		const renderOptions: RenderParameters = {
			sitekey: this.identifier,
			...resolvedOptions,
		};
		
		if (callbacks?.onSolve && !renderOptions.callback) {
			renderOptions.callback = (token: string) => callbacks.onSolve?.(token);
		}
		if (callbacks?.onError && !renderOptions["error-callback"]) {
			renderOptions["error-callback"] = (error?: string | Error) => {
				callbacks.onError?.(error || "Unknown error");
			};
		}
		if (callbacks?.onReady) {
			queueMicrotask(() => callbacks.onReady?.());
		}
		
		return window.hcaptcha.render(element, renderOptions);
	}

	reset(widgetId: string) {
		window.hcaptcha.reset(widgetId);
	}

	async execute(widgetId: string) {
		window.hcaptcha.execute(widgetId);
	}

	destroy(widgetId: string) {
		window.hcaptcha.remove(widgetId);
	}

	getResponse(widgetId: string): string {
		return window.hcaptcha.getResponse(widgetId);
	}

	getHandle(widgetId: string): HCaptchaHandle {
		return this.getCommonHandle(widgetId);
	}
}
