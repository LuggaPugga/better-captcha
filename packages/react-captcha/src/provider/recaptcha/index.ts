import { Provider, type ProviderConfig } from "../../provider";
import { generateCallbackName, loadScript } from "../../utils/load-script";
import type { ReCaptcha, RenderParameters } from "./types";

declare global {
	interface Window {
		grecaptcha: ReCaptcha.ReCaptcha;
	}
}

const RECAPTCHA_ONLOAD_CALLBACK = generateCallbackName("recaptchaOnload");

export class ReCaptchaProvider extends Provider<ProviderConfig> {
	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://www.google.com/recaptcha/api.js",
			},
			sitekey,
		);
	}

	async init() {
		const scriptUrl = this.buildScriptUrl();

		await loadScript(scriptUrl, {
			async: true,
			defer: true,
			callbackName: RECAPTCHA_ONLOAD_CALLBACK,
			keepCallback: true,
		});
	}

	private buildScriptUrl() {
		const url = new URL(this.config.scriptUrl);
		url.searchParams.set("render", "explicit");
		url.searchParams.set("onload", RECAPTCHA_ONLOAD_CALLBACK);
		return url.toString();
	}

	async render(
		element: HTMLElement,
		options?: Omit<RenderParameters, "sitekey">,
	) {
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
		const element = document.getElementById(`react-captcha-${widgetId}`);
		if (element) {
			element.innerHTML = "";
		}
		window.grecaptcha.reset(widgetId);
	}
}

export * from "./recaptcha";
export type { RenderParameters } from "./types";
