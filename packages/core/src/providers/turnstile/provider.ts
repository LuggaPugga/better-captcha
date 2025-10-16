import { type CaptchaHandle, Provider, type ProviderConfig } from "../../provider";
import { loadScript } from "../../utils/load-script";
import type { RenderParameters, Turnstile } from "./types";

declare global {
	interface Window {
		turnstile: Turnstile.Turnstile;
	}
}

export type TurnstileHandle = CaptchaHandle & {
	isExpired: () => boolean;
};

export class TurnstileProvider extends Provider<ProviderConfig, Omit<RenderParameters, "sitekey">, TurnstileHandle> {
	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://challenges.cloudflare.com/turnstile/v0/api.js",
			},
			sitekey,
		);
	}

	async init() {
		const callbackName = `betterCaptchaTurnstile_${Math.random().toString(36).slice(2, 11)}`;

		const url = new URL(this.config.scriptUrl);
		url.searchParams.set("onload", callbackName);

		await loadScript(url.toString());
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "sitekey">) {
		const widgetId = window.turnstile.render(element, {
			sitekey: this.sitekey,
			...options,
		});
		return widgetId ?? undefined;
	}

	reset(widgetId: string) {
		window.turnstile.reset(widgetId);
	}

	async execute(widgetId: string) {
		window.turnstile.execute(widgetId);
	}

	destroy(widgetId: string) {
		window.turnstile.remove(widgetId);
	}

	getResponse(widgetId: string): string {
		return window.turnstile.getResponse(widgetId) ?? "";
	}

	getHandle(widgetId: string): TurnstileHandle {
		return {
			...this.getCommonHandle(widgetId),
			isExpired: () => window.turnstile.isExpired(widgetId),
		};
	}
}
