import { type CaptchaHandle, Provider, type ProviderConfig } from "../../provider";
import { loadScript } from "../../utils/load-script";
import { getSystemTheme } from "../../utils/theme";
import type { PrivateCaptcha, RenderParameters } from "./types";

declare global {
	interface Window {
		privateCaptcha: PrivateCaptcha.PrivateCaptcha;
		[key: string]: unknown;
	}
}

export type PrivateCaptchaHandle = CaptchaHandle & {
	solution: () => string;
	updateStyles: () => void;
};

export class PrivateCaptchaProvider extends Provider<
	ProviderConfig,
	Omit<RenderParameters, "sitekey">,
	PrivateCaptchaHandle
> {
	private widgetMap = new Map<string, PrivateCaptcha.CaptchaWidget>();
	private callbackMap = new Map<string, string[]>();
	private elementMap = new Map<string, HTMLElement>();
	private widgetIdCounter = 0;

	constructor(sitekey: string) {
		super(
			{
				scriptUrl: "https://cdn.privatecaptcha.com/widget/js/privatecaptcha.js",
			},
			sitekey,
		);
	}

	async init() {
		const scriptUrl = this.buildScriptUrl();

		await loadScript(scriptUrl, {
			async: true,
			defer: true,
		});
	}

	private buildScriptUrl() {
		const url = new URL(this.config.scriptUrl);
		url.searchParams.set("render", "explicit");
		return url.toString();
	}

	private generateWidgetId(element: HTMLElement): string {
		if (element.id && !this.widgetMap.has(element.id)) {
			return element.id;
		}

		return `private-captcha-${++this.widgetIdCounter}`;
	}

	private setupCallbacks(
		widgetId: string,
		callbacks: {
			onInit?: (detail: PrivateCaptcha.CaptchaEventDetail) => void;
			onError?: (detail: PrivateCaptcha.CaptchaEventDetail) => void;
			onStart?: (detail: PrivateCaptcha.CaptchaEventDetail) => void;
			onFinish?: (detail: PrivateCaptcha.CaptchaEventDetail) => void;
		},
	): string[] {
		const callbackNames: string[] = [];
		const element = this.elementMap.get(widgetId);

		if (!element) return callbackNames;

		const callbackTypes = [
			{ key: "onInit" as const, attr: "data-init-callback" },
			{ key: "onError" as const, attr: "data-errored-callback" },
			{ key: "onStart" as const, attr: "data-started-callback" },
			{ key: "onFinish" as const, attr: "data-finished-callback" },
		] as const;

		for (const { key, attr } of callbackTypes) {
			const callback = callbacks[key];
			if (callback) {
				const callbackName = `pc_${widgetId}_${key}`;
				window[callbackName] = callback;
				element.setAttribute(attr, callbackName);
				callbackNames.push(callbackName);
			}
		}

		return callbackNames;
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "sitekey">) {
		const { onInit, onError, onStart, onFinish, ...widgetOptions } = options || {};
		if (options?.theme === "auto") {
			widgetOptions.theme = getSystemTheme();
		}
		const widgetId = this.generateWidgetId(element);

		if (!element.id) {
			element.id = widgetId;
		}

		this.elementMap.set(widgetId, element);
		const callbackNames = this.setupCallbacks(widgetId, { onInit, onError, onStart, onFinish });

		const widget = window.privateCaptcha.render(element, {
			sitekey: this.sitekey,
			...widgetOptions,
		});

		if (!widget) {
			this.elementMap.delete(widgetId);
			return undefined;
		}

		this.widgetMap.set(widgetId, widget);
		this.callbackMap.set(widgetId, callbackNames);

		return widgetId;
	}

	reset(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (widget) {
			widget.reset({ sitekey: this.sitekey });
		}
	}

	async execute(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (widget) {
			await widget.execute();
		}
	}

	destroy(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (widget) {
			const element = this.elementMap.get(widgetId);
			if (element) {
				element.innerHTML = "";
			}
		}

		const callbackNames = this.callbackMap.get(widgetId);
		if (callbackNames) {
			for (const name of callbackNames) {
				delete window[name];
			}
			this.callbackMap.delete(widgetId);
		}

		this.widgetMap.delete(widgetId);
		this.elementMap.delete(widgetId);
	}

	getResponse(widgetId: string): string {
		const widget = this.widgetMap.get(widgetId);
		return widget?.solution() ?? "";
	}

	getHandle(widgetId: string): PrivateCaptchaHandle {
		const widget = this.widgetMap.get(widgetId);
		return {
			...this.getCommonHandle(widgetId),
			solution: () => widget?.solution() ?? "",
			updateStyles: () => widget?.updateStyles(),
		};
	}
}
