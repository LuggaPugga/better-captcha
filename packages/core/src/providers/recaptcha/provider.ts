import { type CaptchaHandle, Provider, type ProviderConfig } from "../../provider";
import { loadScript } from "../../utils/load-script";
import { getSystemTheme } from "../../utils/theme";
import type { ReCaptcha, RenderParameters } from "./types";

declare global {
	interface Window {
		grecaptcha: ReCaptcha.ReCaptcha;
	}
}

export type ReCaptchaHandle = CaptchaHandle;

export class ReCaptchaProvider extends Provider<ProviderConfig, Omit<RenderParameters, "sitekey">, ReCaptchaHandle> {
	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://www.google.com/recaptcha/api.js",
			},
			sitekey,
		);
	}

	async init() {
		const url = new URL(this.config.scriptUrl);
		url.searchParams.set("render", "explicit");
		url.searchParams.set("onload", "betterCaptchaRecaptchaOnload");
		await loadScript(url.toString());
	}

	async render(element: HTMLElement, options?: Omit<RenderParameters, "sitekey">) {
		if (options?.theme === "auto") {
			options.theme = getSystemTheme();
		}
		return new Promise<number>((resolve) => {
			window.grecaptcha.ready(() => {
				const widgetId = window.grecaptcha.render(element, {
					sitekey: this.sitekey,
					...options,
				});
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
