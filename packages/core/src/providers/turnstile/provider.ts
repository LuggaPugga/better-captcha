import { type CaptchaCallbacks, type CaptchaHandle, Provider, type ProviderConfig } from "../../provider";
import { generateCallbackName, loadScript } from "../../utils/load-script";
import type { RenderParameters, Turnstile } from "./types";

declare global {
	interface Window {
		turnstile: Turnstile.Turnstile;
	}
}

const TURNSTILE_ONLOAD_CALLBACK = generateCallbackName("turnstileOnload");

export type TurnstileHandle = CaptchaHandle & {
	isExpired: () => boolean;
};

export class TurnstileProvider extends Provider<ProviderConfig, Omit<RenderParameters, "sitekey">, TurnstileHandle> {
	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://challenges.cloudflare.com/turnstile/v0/api.js",
			},
			sitekey,
		);
	}

	async init() {
		const scriptUrl = this.buildScriptUrl();

		await loadScript(scriptUrl, {
			async: true,
			defer: true,
			callbackName: TURNSTILE_ONLOAD_CALLBACK,
		});
	}

	private buildScriptUrl() {
		const url = new URL(this.config.scriptUrl);
		url.searchParams.set("onload", TURNSTILE_ONLOAD_CALLBACK);
		return url.toString();
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "sitekey">, callbacks?: CaptchaCallbacks) {
		const renderOptions: RenderParameters = {
			sitekey: this.identifier,
			...options,
		};

		if (callbacks?.onSolve && !renderOptions.callback) {
			renderOptions.callback = (token: string) => callbacks.onSolve?.(token);
		}
		if (callbacks?.onError && !renderOptions["error-callback"]) {
			renderOptions["error-callback"] = (error: string) => callbacks.onError?.(error);
		}
		if (callbacks?.onReady) {
			queueMicrotask(() => callbacks.onReady?.());
		}

		const widgetId = window.turnstile.render(element, renderOptions);
		return widgetId ?? undefined;
	}

	reset(widgetId: string) {
		window.turnstile.reset(widgetId);
	}

	async execute(widgetId: string) {
		window.turnstile.execute(widgetId);
	}

	destroy(widgetId: string) {
		window.turnstile.remove(widgetId);
	}

	getResponse(widgetId: string): string {
		return window.turnstile.getResponse(widgetId) ?? "";
	}

	getHandle(widgetId: string): TurnstileHandle {
		return {
			...this.getCommonHandle(widgetId),
			isExpired: () => window.turnstile.isExpired(widgetId),
		};
	}
}
