import {
	loadScript,
	Provider,
	type ProviderConfig,
} from "@react-captcha/core/src/index";
import type { RenderParameters } from "./types";

export class TurnstileProvider extends Provider<ProviderConfig> {
	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://challenges.cloudflare.com/turnstile/v0/api.js",
			},
			sitekey,
		);
	}

	async init() {
		await loadScript(this.config.scriptUrl);
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "sitekey">) {
		const widgetId = window.turnstile.render(element, {
			sitekey: this.sitekey,
			...options,
		});
		return widgetId;
	}

	reset(widgetId: string) {
		window.turnstile.reset(widgetId);
	}
}
