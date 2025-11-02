import {
	type CaptchaCallbacks,
	type CaptchaHandle,
	Provider,
	type ProviderConfig,
	type ScriptOptions,
} from "../../provider";
import { loadScript } from "../../utils/load-script";
import type {
	CapErrorEvent,
	CapProgressEvent,
	CapResetEvent,
	CapSolveEvent,
	CapWidget,
	RenderParameters,
} from "./types";

export type CapWidgetHandle = CaptchaHandle;

export class CapWidgetProvider extends Provider<ProviderConfig, Omit<RenderParameters, "element">, CapWidgetHandle> {
	private widgetMap = new Map<string, CapWidget>();

	constructor(endpoint: string, scriptOptions?: ScriptOptions) {
		super(
			{
				scriptUrl: "https://cdn.jsdelivr.net/npm/@cap.js/widget@0.1.30",
				scriptOptions,
			},
			endpoint,
		);
	}

	async init() {
		if (this.config.scriptOptions?.autoLoad !== false) {
			await loadScript(this.config.scriptUrl, {
				type: "module",
				async: true,
				defer: true,
				timeout: this.config.scriptOptions?.timeout,
			});
		}

		if (typeof window !== "undefined" && customElements) {
			await customElements.whenDefined("cap-widget");
		}
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "element">, callbacks?: CaptchaCallbacks): string {
		const widget = document.createElement("cap-widget") as CapWidget;
		widget.setAttribute("data-cap-api-endpoint", this.identifier);

		const attributeMap: Record<string, string> = {
			workerCount: "data-cap-worker-count",
			hiddenFieldName: "data-cap-hidden-field-name",
			i18nInitialState: "data-cap-i18n-initial-state",
			i18nVerifyingLabel: "data-cap-i18n-verifying-label",
			i18nSolvedLabel: "data-cap-i18n-solved-label",
			i18nErrorLabel: "data-cap-i18n-error-label",
			i18nVerifyAriaLabel: "data-cap-i18n-verify-aria-label",
			i18nVerifyingAriaLabel: "data-cap-i18n-verifying-aria-label",
			i18nVerifiedAriaLabel: "data-cap-i18n-verified-aria-label",
			i18nErrorAriaLabel: "data-cap-i18n-error-aria-label",
			i18nWasmDisabled: "data-cap-i18n-wasm-disabled",
		};

		const callbackMap: Record<
			string,
			{ event: string; handler?: (event: CapSolveEvent | CapProgressEvent | CapResetEvent | CapErrorEvent) => void }
		> = {
			onsolve: { event: "solve" },
			onprogress: { event: "progress" },
			onreset: { event: "reset" },
			onerror: { event: "error" },
		};

		if (options) {
			for (const [key, value] of Object.entries(options)) {
				if (value === undefined || value === null) {
					continue;
				}

				if (callbackMap[key]) {
					const callbackInfo = callbackMap[key];
					if (typeof value === "function") {
						callbackInfo.handler = value as (
							event: CapSolveEvent | CapProgressEvent | CapResetEvent | CapErrorEvent,
						) => void;
					} else if (typeof value === "string") {
						widget.setAttribute(key, value);
					}
					continue;
				}

				const attributeName = attributeMap[key] || key;
				widget.setAttribute(attributeName, String(value));
			}
		}

		element.appendChild(widget);

		const widgetId = `cap-widget-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
		widget.id = widgetId;

		if (callbackMap.onsolve?.handler) {
			widget.addEventListener("solve", callbackMap.onsolve.handler as (event: CapSolveEvent) => void);
		}
		if (callbackMap.onprogress?.handler) {
			widget.addEventListener("progress", callbackMap.onprogress.handler as (event: CapProgressEvent) => void);
		}
		if (callbackMap.onreset?.handler) {
			widget.addEventListener("reset", callbackMap.onreset.handler as (event: CapResetEvent) => void);
		}
		if (callbackMap.onerror?.handler) {
			widget.addEventListener("error", callbackMap.onerror.handler as (event: CapErrorEvent) => void);
		}

		if (callbacks?.onSolve) {
			widget.addEventListener("solve", (event: CapSolveEvent) => {
				callbacks.onSolve?.(event.detail.token);
			});
		}
		if (callbacks?.onError) {
			widget.addEventListener("error", (event: CapErrorEvent) => {
				callbacks.onError?.(event.detail.message);
			});
		}
		if (callbacks?.onReady) {
			queueMicrotask(() => callbacks.onReady?.());
		}

		this.widgetMap.set(widgetId, widget);

		return widgetId;
	}

	reset(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (widget) {
			widget.reset();
		}
	}

	async execute(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (widget) {
			await widget.solve();
		}
	}

	destroy(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (!widget) {
			return;
		}

		widget.remove();
		this.widgetMap.delete(widgetId);
	}

	getResponse(widgetId: string): string {
		const widget = this.widgetMap.get(widgetId);
		return widget?.token ?? "";
	}

	getHandle(widgetId: string): CapWidgetHandle {
		return this.getCommonHandle(widgetId);
	}
}
