import { type CaptchaHandle, Provider, type ProviderConfig } from "../../provider";
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
	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://cdn.captchafox.com/api.js",
			},
			sitekey,
		);
	}

	async init() {
		await loadScript(this.config.scriptUrl, {
			type: "module",
			async: true,
			defer: true,
		});
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "element" | "sitekey">) {
		if (options?.theme === "auto") {
			options.theme = getSystemTheme();
		}
		return window.captchafox?.render(element, {
			sitekey: this.sitekey,
			...options,
		});
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
