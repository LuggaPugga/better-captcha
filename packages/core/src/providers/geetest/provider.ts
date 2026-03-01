import {
  type CaptchaCallbacks,
  type CaptchaHandle,
  Provider,
  type ProviderConfig,
  type ScriptOptions,
} from "../../provider";
import { generateCallbackName, loadScript } from "../../utils/load-script";
import type { Geetest, RenderParameters } from "./types";


const GEETEST_ONLOAD_CALLBACK = generateCallbackName("geetestOnload");

export type GeetestHandle = Omit<CaptchaHandle, "getResponse"> & {
  getResponse: (widgetId: string) => Geetest.ValidateResult | false;
};

export type GeetestCaptchaCallbacks = Omit<CaptchaCallbacks, "onSolve" | "onError"> & {
  onSolve(result: Geetest.ValidateResult): void;
  onError(error: Geetest.GeetestError): void;
};


export class GeetestProvider extends Provider<ProviderConfig, Omit<RenderParameters, "sitekey">, GeetestHandle> {
  private widgetMap = new Map<string, Geetest.Geetest>();
  private elementMap = new Map<string, HTMLElement>();
  private widgetIdCounter = 0;

  constructor(sitekey: string, scriptOptions?: ScriptOptions) {
    super(
      {
        scriptUrl: "https://static.geetest.com/v4/gt4.js",
        scriptOptions,
      },
      sitekey,
    );
  }
  

  async init() {
    const scriptUrl = this.config.scriptOptions?.overrideScriptUrl ?? this.buildScriptUrl();

    if (this.config.scriptOptions?.autoLoad !== false) {
      await loadScript(scriptUrl, {
        async: true,
        defer: true,
        callbackName: GEETEST_ONLOAD_CALLBACK,
        timeout: this.config.scriptOptions?.timeout,
      });
    }
  }

  private buildScriptUrl() {
    const url = new URL(this.config.scriptUrl);
    url.searchParams.set("render", "explicit");
    url.searchParams.set("onload", GEETEST_ONLOAD_CALLBACK);
    return url.toString();
  }

	private generateWidgetId(element: HTMLElement): string {
		if (element.id && !this.widgetMap.has(element.id)) {
			return element.id;
		}

		return `geetest-captcha-${++this.widgetIdCounter}`;
	}

  async render(element: HTMLElement, options?: Omit<RenderParameters, "captchaId">, callbacks?: GeetestCaptchaCallbacks) {
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
      window.initGeetest(renderOptions, (captcha: Geetest.Geetest) => {
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
          captcha.onError(callbacks.onError);
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

  getHandle(widgetId: number): GeetestHandle {
    return this.getCommonHandle(widgetId);
  }
}
