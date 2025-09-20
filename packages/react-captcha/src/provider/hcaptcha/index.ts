import { Provider, type ProviderConfig } from "@/provider";
import { loadScript } from "@/utils/load-script";
import type { HCaptcha, RenderParameters } from "./types";

declare global {
	interface Window {
		hcaptcha: HCaptcha.HCaptcha;
	}
}

export class HCaptchaProvider extends Provider<ProviderConfig> {
	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://js.hcaptcha.com/1/api.js",
			},
			sitekey,
		);
	}

	async init() {
		await loadScript(this.config.scriptUrl);
	}

	render(element: HTMLElement, options?: RenderParameters) {
		return window.hcaptcha.render(element, {
			sitekey: this.sitekey,
			...options,
		});
	}

	reset(widgetId: string) {
		window.hcaptcha.reset(widgetId);
	}

	async execute(widgetId: string) {
		window.hcaptcha.execute(widgetId);
	}
}
