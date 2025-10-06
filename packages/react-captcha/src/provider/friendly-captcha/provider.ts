import {
	type CaptchaHandle,
	Provider,
	type ProviderConfig,
} from "../../provider";
import { loadScript } from "../../utils/load-script";
import type {
	FrcaptchaGlobal,
	FriendlyCaptchaSDK,
	RenderParameters,
} from "./types";

declare global {
	interface Window {
		frcaptcha: FrcaptchaGlobal;
	}
}

export type FriendlyCaptchaHandle = CaptchaHandle & {
	getResponse: () => string;
	getState: () => FriendlyCaptchaSDK["state"];
};

export class FriendlyCaptchaProvider extends Provider<
	ProviderConfig,
	Omit<RenderParameters, "element" | "sitekey">,
	FriendlyCaptchaHandle
> {
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

	async execute(widgetId: string) {
		window.frcaptcha.widgets.get(widgetId)?.trigger("programmatic");
	}

	destroy(widgetId: string) {
		window.frcaptcha.widgets.get(widgetId)?.destroy();
	}

	getHandle(widgetId: string): FriendlyCaptchaHandle {
		return {
			...this.getCommonHandle(widgetId),
			getResponse: () =>
				window.frcaptcha.widgets.get(widgetId)?.getResponse() ?? "",
			getState: () =>
				window.frcaptcha.widgets.get(widgetId)?.getState() ?? "destroyed",
		};
	}
}
