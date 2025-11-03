import {
	type CaptchaCallbacks,
	type CaptchaHandle,
	Provider,
	type ProviderConfig,
	type ScriptOptions,
} from "../../provider";
import { loadScript } from "../../utils/load-script";
import type { FrcaptchaGlobal, FriendlyCaptchaSDK, RenderParameters } from "./types";

declare global {
	interface Window {
		frcaptcha: FrcaptchaGlobal;
	}
}

export type FriendlyCaptchaHandle = CaptchaHandle & {
	getState: () => FriendlyCaptchaSDK["state"];
};

export class FriendlyCaptchaProvider extends Provider<
	ProviderConfig,
	Omit<RenderParameters, "element" | "sitekey">,
	FriendlyCaptchaHandle
> {
	constructor(sitekey: string, scriptOptions?: ScriptOptions) {
		super(
			{
				scriptUrl: "https://cdn.jsdelivr.net/npm/@friendlycaptcha/sdk@0.1.32/site.min.js",
				scriptOptions,
			},
			sitekey,
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
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "element" | "sitekey">, callbacks?: CaptchaCallbacks) {
		const widget = window.frcaptcha.createWidget({
			element,
			sitekey: this.identifier,
			...options,
		});

		if (callbacks?.onSolve) {
			widget.addEventListener("frc:widget.complete", (event) => {
				callbacks.onSolve?.(event.detail.response);
			});
		}
		if (callbacks?.onError) {
			widget.addEventListener("frc:widget.error", (event) => {
				const error = event.detail.error;
				callbacks.onError?.(error ? `${error.code}: ${error.detail || ""}` : "Unknown error");
			});
		}
		if (callbacks?.onReady) {
			const checkReady = () => {
				if (widget.getState() === "ready") {
					callbacks.onReady?.();
				} else {
					widget.addEventListener(
						"frc:widget.statechange",
						(event) => {
							if (event.detail.state === "ready") {
								callbacks.onReady?.();
							}
						},
						{ once: true },
					);
				}
			};
			queueMicrotask(checkReady);
		}

		return widget.id;
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

	getResponse(widgetId: string): string {
		return window.frcaptcha.widgets.get(widgetId)?.getResponse() ?? "";
	}

	getHandle(widgetId: string): FriendlyCaptchaHandle {
		return {
			...this.getCommonHandle(widgetId),
			getState: () => window.frcaptcha.widgets.get(widgetId)?.getState() ?? "destroyed",
		};
	}
}
