import { Provider, type ProviderConfig } from "../../provider";
import { generateCallbackName, loadScript } from "../../utils/load-script";
import type { HCaptcha, RenderParameters } from "./types";

declare global {
	interface Window {
		hcaptcha: HCaptcha.HCaptcha;
	}
}

const HCAPTCHA_ONLOAD_CALLBACK = generateCallbackName("hcaptchaOnload");

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
		const scriptUrl = this.buildScriptUrl();

		await loadScript(scriptUrl, {
			async: true,
			defer: true,
			callbackName: HCAPTCHA_ONLOAD_CALLBACK,
			keepCallback: true,
		});
	}

	private buildScriptUrl() {
		const url = new URL(this.config.scriptUrl);
		url.searchParams.set("render", "explicit");
		url.searchParams.set("onload", HCAPTCHA_ONLOAD_CALLBACK);
		return url.toString();
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

	destroy(widgetId: string) {
		window.hcaptcha.remove(widgetId);
	}
}

export * from "./hcaptcha";
export type { RenderParameters } from "./types";
