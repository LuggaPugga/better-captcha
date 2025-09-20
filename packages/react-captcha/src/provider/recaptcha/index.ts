import { Provider, type ProviderConfig } from "@/provider";
import { loadScript } from "@/utils/load-script";
import type { ReCaptcha, RenderParameters } from "./types";

declare global {
	interface Window {
		grecaptcha: ReCaptcha.ReCaptcha;
	}
}

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
		return await loadScript(this.config.scriptUrl);
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
		window.grecaptcha.execute(widgetId);
	}
}
