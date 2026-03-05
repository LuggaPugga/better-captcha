import {
	type CaptchaCallbacks,
	type CaptchaHandle,
	Provider,
	type ProviderConfig,
	type ScriptOptions,
} from "../../provider";
import { loadScript } from "../../utils/load-script";
import type { Geetest, RenderParameters } from "./types";

export type GeetestHandle = CaptchaHandle<Geetest.ValidateResult | false>;

export class GeetestProvider extends Provider<
	ProviderConfig,
	Omit<RenderParameters, "captchaId">,
	GeetestHandle,
	Geetest.ValidateResult | false,
	Geetest.ValidateResult
> {
	private widgetMap = new Map<string, Geetest.Geetest>();
	private elementMap = new Map<string, HTMLElement>();
	private widgetIdCounter = 0;

	constructor(captchaId: string, scriptOptions?: ScriptOptions) {
		super(
			{
				scriptUrl: "https://static.geetest.com/v4/gt4.js",
				scriptOptions,
			},
			captchaId,
		);
	}

	async init() {
		const scriptUrl = this.config.scriptOptions?.overrideScriptUrl ?? this.config.scriptUrl;

		if (this.config.scriptOptions?.autoLoad !== false) {
			await loadScript(scriptUrl, {
				async: true,
				defer: true,
				timeout: this.config.scriptOptions?.timeout,
			});
		}
	}

	private generateWidgetId(element: HTMLElement): string {
		if (element.id && !this.widgetMap.has(element.id)) {
			return element.id;
		}

		return `geetest-captcha-${++this.widgetIdCounter}`;
	}

	async render(
		element: HTMLElement,
		options?: Omit<RenderParameters, "captchaId">,
		callbacks?: CaptchaCallbacks<Geetest.ValidateResult>,
	) {
		const resolvedOptions = options ? { ...options } : undefined;

		const renderOptions: RenderParameters = {
			captchaId: this.identifier,
			...resolvedOptions,
		};

		const widgetId = this.generateWidgetId(element);

		if (!element.id) {
			element.id = widgetId;
		}

		this.elementMap.set(widgetId, element);

		return new Promise<string>((resolve) => {
			window.initGeetest4(renderOptions, (captcha: Geetest.Geetest) => {
				this.widgetMap.set(widgetId, captcha);

				if (renderOptions?.product !== "bind") {
					captcha.appendTo(element);
				}

				if (callbacks?.onReady) {
					captcha.onReady(callbacks.onReady);
				}
				if (callbacks?.onSolve) {
					captcha.onSuccess(() => {
						const result = this.getResponse(widgetId);
						result && callbacks.onSolve?.(result);
					});
				}
				if (callbacks?.onError) {
					captcha.onError((error) => {
						callbacks.onError?.(new Error(error.msg));
					});
				}

				resolve(widgetId);
			});
		});
	}

	reset(widgetId: string) {
		const captcha = this.widgetMap.get(widgetId);
		if (captcha) {
			captcha.reset();
		}
	}

	async execute(widgetId: string) {
		const captcha = this.widgetMap.get(widgetId);
		if (captcha) {
			captcha.showCaptcha();
		}
	}

	destroy(widgetId: string) {
		const element = this.elementMap.get(widgetId);
		const captcha = this.widgetMap.get(widgetId);
		if (element) {
			element.innerHTML = "";
		}
		captcha?.destroy();
		this.widgetMap.delete(widgetId);
		this.elementMap.delete(widgetId);
	}

	getResponse(widgetId: string): Geetest.ValidateResult | false {
		const captcha = this.widgetMap.get(widgetId);
		if (!captcha) {
			return false;
		}
		return captcha.getValidate();
	}
}
