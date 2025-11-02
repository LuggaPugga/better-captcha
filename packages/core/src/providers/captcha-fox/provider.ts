import {
	type CaptchaCallbacks,
	type CaptchaHandle,
	Provider,
	type ProviderConfig,
	type ScriptOptions,
} from "../../provider";
import { loadScript } from "../../utils/load-script";
import { getSystemTheme } from "../../utils/theme";
import type { RenderParameters, WidgetApi } from "./types";

declare global {
	interface Window {
		captchafox?: WidgetApi;
	}
}

export type CaptchaFoxHandle = CaptchaHandle;

export class CaptchaFoxProvider extends Provider<
	ProviderConfig,
	Omit<RenderParameters, "element" | "sitekey">,
	CaptchaFoxHandle
> {
	constructor(sitekey: string, scriptOptions?: ScriptOptions) {
		super(
			{
				scriptUrl: "https://cdn.captchafox.com/api.js",
				scriptOptions,
			},
			sitekey,
		);
	}

	async init() {
		if (this.config.scriptOptions?.autoLoad !== false) {
			await loadScript(this.config.scriptUrl, {
				type: "module",
				async: true,
				defer: true,
				timeout: this.config.scriptOptions?.timeout,
			});
		}
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "element" | "sitekey">, callbacks?: CaptchaCallbacks) {
		const resolvedOptions = options ? { ...options } : undefined;
		if (resolvedOptions?.theme === "auto") {
			resolvedOptions.theme = getSystemTheme();
		}

		const renderOptions: RenderParameters = {
			sitekey: this.identifier,
			...resolvedOptions,
		};

		if (callbacks?.onSolve && !renderOptions.onVerify) {
			renderOptions.onVerify = (token: string) => callbacks.onSolve?.(token);
		}
		if (callbacks?.onError && !renderOptions.onError) {
			renderOptions.onError = (error?: Error | string) => callbacks.onError?.(error || "Unknown error");
		}
		if (callbacks?.onReady) {
			queueMicrotask(() => callbacks.onReady?.());
		}

		return window.captchafox?.render(element, renderOptions);
	}

	reset(widgetId: string) {
		window.captchafox?.reset(widgetId);
	}

	async execute(widgetId: string) {
		window.captchafox?.execute(widgetId);
	}

	destroy(widgetId: string) {
		window.captchafox?.remove(widgetId);
	}

	getResponse(widgetId: string): string {
		return window.captchafox?.getResponse(widgetId) ?? "";
	}

	getHandle(widgetId: string): CaptchaFoxHandle {
		return {
			...this.getCommonHandle(widgetId),
		};
	}
}
