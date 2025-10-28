import { type CaptchaHandle, Provider, type ProviderConfig } from "../../provider";
import { loadScript } from "../../utils/load-script";
import { getSystemTheme } from "../../utils/theme";
import type { RenderParameters, WidgetApi } from "./types";

declare global {
	interface Window {
		procaptcha?: WidgetApi;
	}
}

export type ProsopoHandle = CaptchaHandle;

export class ProsopoProvider extends Provider<ProviderConfig, Omit<RenderParameters, "siteKey">, ProsopoHandle> {
	private widgetId: string | null = null;

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
		this.widgetId = `prosopo-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		const resolvedOptions = options ? { ...options } : undefined;
		if (resolvedOptions?.theme === "auto") {
			resolvedOptions.theme = getSystemTheme();
		}

		window.procaptcha?.render(element, {
			siteKey: this.sitekey,
			...resolvedOptions,
		});

		return this.widgetId;
	}

	reset(_widgetId: string): void {
		if (window.procaptcha?.ready) {
			window.procaptcha.reset();
		}
	}

	async execute(_widgetId: string): Promise<void> {
		if (window.procaptcha?.ready) {
			window.procaptcha.execute();
		}
	}

	destroy(_widgetId: string): void {
		if (this.widgetId) {
			if (window.procaptcha?.ready) {
				window.procaptcha.reset();
			}
		}

		this.widgetId = null;
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
