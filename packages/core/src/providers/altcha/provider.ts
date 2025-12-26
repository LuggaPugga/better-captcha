import {
	type CaptchaCallbacks,
	type CaptchaHandle,
	Provider,
	type ProviderConfig,
	type ScriptOptions,
} from "../../provider";
import { loadScript } from "../../utils/load-script";
import type {
	AltchaErrorEvent,
	AltchaLoadEvent,
	AltchaStateChangeEvent,
	AltchaVerifiedEvent,
	AltchaWidget,
	RenderParameters,
} from "./types";

export type AltchaHandle = CaptchaHandle;

export class AltchaProvider extends Provider<ProviderConfig, Omit<RenderParameters, "element">, AltchaHandle> {
	private widgetMap = new Map<string, AltchaWidget>();
	private responseMap = new Map<string, string>();

	constructor(endpoint: string, scriptOptions?: ScriptOptions) {
		super(
			{
				scriptUrl: "https://cdn.jsdelivr.net/gh/altcha-org/altcha/dist/altcha.min.js",
				scriptOptions,
			},
			endpoint,
		);
	}

	async init() {
		if (this.config.scriptOptions?.autoLoad !== false) {
			const scriptUrl = this.config.scriptOptions?.overrideScriptUrl ?? this.config.scriptUrl;
			await loadScript(scriptUrl, {
				type: "module",
				async: true,
				defer: true,
				timeout: this.config.scriptOptions?.timeout,
			});
		}

		if (typeof window !== "undefined" && customElements) {
			await customElements.whenDefined("altcha-widget");
		}
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "element">, callbacks?: CaptchaCallbacks): string {
		const widget = document.createElement("altcha-widget") as AltchaWidget;
		widget.setAttribute("challengeurl", this.identifier);

		const attributeMap: Record<string, string> = {
			auto: "auto",
			credentials: "credentials",
			delay: "delay",
			disableautofocus: "disableautofocus",
			expire: "expire",
			floating: "floating",
			floatinganchor: "floatinganchor",
			floatingoffset: "floatingoffset",
			floatingpersist: "floatingpersist",
			hidefooter: "hidefooter",
			hidelogo: "hidelogo",
			language: "language",
			maxnumber: "maxnumber",
			name: "name",
			overlay: "overlay",
			overlaycontent: "overlaycontent",
			strings: "strings",
			refetchonexpire: "refetchonexpire",
			workers: "workers",
			workerurl: "workerurl",
			debug: "debug",
			test: "test",
		};

		const callbackMap: Record<
			string,
			{
				event: string;
				handler?: (event: AltchaStateChangeEvent | AltchaVerifiedEvent | AltchaLoadEvent | AltchaErrorEvent) => void;
			}
		> = {
			onstatechange: { event: "statechange" },
			onverified: { event: "verified" },
			onload: { event: "load" },
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
							event: AltchaStateChangeEvent | AltchaVerifiedEvent | AltchaLoadEvent | AltchaErrorEvent,
						) => void;
					}
					continue;
				}

				const attributeName = attributeMap[key] || key;
				if (typeof value === "boolean") {
					if (value) {
						widget.setAttribute(attributeName, "");
					}
				} else {
					widget.setAttribute(attributeName, String(value));
				}
			}
		}

		element.appendChild(widget);

		const widgetId = `altcha-widget-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
		widget.id = widgetId;

		if (callbackMap.onstatechange?.handler) {
			widget.addEventListener(
				"statechange",
				callbackMap.onstatechange.handler as (event: AltchaStateChangeEvent) => void,
			);
		}
		if (callbackMap.onverified?.handler) {
			widget.addEventListener("verified", callbackMap.onverified.handler as (event: AltchaVerifiedEvent) => void);
		}
		if (callbackMap.onload?.handler) {
			widget.addEventListener("load", callbackMap.onload.handler as (event: AltchaLoadEvent) => void);
		}
		if (callbackMap.onerror?.handler) {
			widget.addEventListener("error", callbackMap.onerror.handler as (event: AltchaErrorEvent) => void);
		}

		widget.addEventListener("verified", (event: AltchaVerifiedEvent) => {
			this.responseMap.set(widgetId, event.detail.payload);
			callbacks?.onSolve?.(event.detail.payload);
		});

		widget.addEventListener("statechange", (event: AltchaStateChangeEvent) => {
			if (event.detail.state === "error") {
				callbacks?.onError?.(new Error("Altcha verification failed"));
			}
		});

		if (callbacks?.onReady) {
			widget.addEventListener("load", () => {
				callbacks.onReady?.();
			});
		}

		this.widgetMap.set(widgetId, widget);

		return widgetId;
	}

	reset(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (widget) {
			widget.reset();
			this.responseMap.delete(widgetId);
		}
	}

	async execute(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (widget) {
			await widget.verify();
		}
	}

	destroy(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (!widget) {
			return;
		}

		widget.remove();
		this.widgetMap.delete(widgetId);
		this.responseMap.delete(widgetId);
	}

	getResponse(widgetId: string): string {
		return this.responseMap.get(widgetId) ?? "";
	}

	getHandle(widgetId: string): AltchaHandle {
		return this.getCommonHandle(widgetId);
	}
}
