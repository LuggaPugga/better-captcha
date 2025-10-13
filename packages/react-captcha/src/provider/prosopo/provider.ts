import { type CaptchaHandle, Provider, type ProviderConfig } from "../../provider";
import { loadScript } from "../../utils/load-script";
import { getSystemTheme } from "../../utils/theme";
import type { RenderParameters, RenderWidgetFunction, WidgetApi } from "./types";

declare global {
	interface Window {
		procaptcha?: WidgetApi;
	}
}

export type ProsopoHandle = CaptchaHandle;

export class ProsopoProvider extends Provider<ProviderConfig, Omit<RenderParameters, "siteKey">, ProsopoHandle> {
	private widgetId: string | null = null;
	private element: HTMLElement | null = null;

	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://js.prosopo.io/js/procaptcha.bundle.js",
			},
			sitekey,
		);
	}

	async init(): Promise<void> {
		await loadScript(this.config.scriptUrl, {
			type: "module",
			async: true,
			defer: true,
		});
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "siteKey">): string {
		this.element = element;
		this.widgetId = `prosopo-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		element.setAttribute("id", this.widgetId);

		const renderOptions: RenderParameters = {
			siteKey: this.sitekey,
			...options,
		};

		if (renderOptions.theme === "auto") {
			renderOptions.theme = getSystemTheme();
		}

		if (window.procaptcha) {
			const renderFunction: RenderWidgetFunction = window.procaptcha.render;
			renderFunction(element, renderOptions);
		}

		return this.widgetId;
	}

	reset(_widgetId: string): void {
		if (window.procaptcha) {
			window.procaptcha.reset();
		}
	}

	async execute(_widgetId: string): Promise<void> {
		if (window.procaptcha) {
			window.procaptcha.execute();
		}
	}

	destroy(_widgetId: string): void {
		if (this.element) {
			this.element.classList.remove("procaptcha");
			this.element.removeAttribute("data-sitekey");
			this.element.removeAttribute("data-captcha-type");
			this.element.removeAttribute("data-theme");
			this.element.removeAttribute("data-language");
			this.element.removeAttribute("data-web3");
			this.element.removeAttribute("data-callback");
			this.element.removeAttribute("data-size");
			this.element.removeAttribute("id");
		}

		if (this.widgetId) {
			const callbackName = `prosopoCallback_${this.widgetId}`;
			if ((window as Record<string, unknown>)[callbackName]) {
				delete (window as Record<string, unknown>)[callbackName];
			}
		}

		this.widgetId = null;
		this.element = null;
	}

	getResponse(_widgetId: string): string {
		const responseInput = document.querySelector('input[name="procaptcha-response"]') as HTMLInputElement;
		return responseInput?.value ?? "";
	}

	getHandle(widgetId: string): ProsopoHandle {
		return {
			...this.getCommonHandle(widgetId),
		};
	}
}
