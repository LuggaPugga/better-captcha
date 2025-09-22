import { Provider, type ProviderConfig } from "../../provider";
import { generateCallbackName, loadScript } from "../../utils/load-script";
import type { RenderParameters } from "./types";

const TURNSTILE_ONLOAD_CALLBACK = generateCallbackName("turnstileOnload");

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
		if (this.isTurnstileReady()) {
			return;
		}

		const scriptUrl = this.buildScriptUrl();

		await loadScript(scriptUrl, {
			async: true,
			defer: true,
			callbackName: TURNSTILE_ONLOAD_CALLBACK,
			keepCallback: true,
			callbackResolveCondition: () => this.isTurnstileReady(),
		});
	}

	private buildScriptUrl() {
		try {
			const url = new URL(this.config.scriptUrl);
			url.searchParams.set("onload", TURNSTILE_ONLOAD_CALLBACK);
			return url.toString();
		} catch {
			const separator = this.config.scriptUrl.includes("?") ? "&" : "?";
			return `${this.config.scriptUrl}${separator}onload=${TURNSTILE_ONLOAD_CALLBACK}`;
		}
	}

	private isTurnstileReady() {
		return (
			typeof window !== "undefined" &&
			typeof window.turnstile !== "undefined" &&
			typeof window.turnstile.render === "function"
		);
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

	async execute(widgetId: string) {
		window.turnstile.execute(widgetId);
	}

	destroy(widgetId: string) {
		window.turnstile.remove(widgetId);
	}
}

export * from "./turnstile";
export type { RenderParameters } from "./types";
