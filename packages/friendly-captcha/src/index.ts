import {
	loadScript,
	Provider,
	type ProviderConfig,
} from "@react-captcha/core/src/index";
import type { FrcaptchaGlobal, RenderParameters } from "./types";

declare global {
	interface Window {
		frcaptcha: FrcaptchaGlobal;
	}
}

export class FriendlyCaptchaProvider extends Provider<ProviderConfig> {
	constructor(sitekey: string) {
		super(
			{
				scriptUrl:
					"https://cdn.jsdelivr.net/npm/@friendlycaptcha/sdk@0.1.27/site.min.js",
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

	render(
		element: HTMLElement,
		options?: Omit<RenderParameters, "element" | "sitekey">,
	) {
		return window.frcaptcha.createWidget({
			element,
			sitekey: this.sitekey,
			...options,
		}).id;
	}

	reset(widgetId: string) {
		window.frcaptcha.widgets.get(widgetId)?.reset();
	}
}
