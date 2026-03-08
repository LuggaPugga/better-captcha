import {
	type CaptchaCallbacks,
	type CaptchaHandle,
	Provider,
	type ProviderConfig,
	type ScriptOptions,
} from "../../provider";
import { loadScript } from "../../utils/load-script";
import type { GlobalTSec, RenderParameters } from "./types";

export type TSecHandle = CaptchaHandle;

export class TSecProvider extends Provider<
  ProviderConfig, 
  Omit<RenderParameters, "sitekey">, 
  TSecHandle
  // todo: should wait feat/geetest merged
  // GlobalTSec.TencentCaptchaResult,
  // GlobalTSec.TencentCaptchaResult,
> {
  private widgetMap = new Map<string, GlobalTSec.TencentCaptcha>();
  private elementMap = new Map<string, HTMLElement>();
  private widgetIdCounter = 0;

	constructor(sitekey: string, scriptOptions?: ScriptOptions) {
		super(
			{
				scriptUrl: "https://ca.turing.captcha.qcloud.com/TJNCaptcha-global.js",
				scriptOptions,
			},
			sitekey,
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

    return `tsec-widget-${++this.widgetIdCounter}`;
  }

	render(element: HTMLElement, options?: Omit<RenderParameters, "sitekey">, callbacks?: CaptchaCallbacks) {
    const renderOptions = options ?? {};
    const widgetId = this.generateWidgetId(element);
    if (!element.id) {
      element.id = widgetId;
    }
    this.elementMap.set(widgetId, element);

    if (callbacks?.onReady && !renderOptions.ready) {
      renderOptions.ready = () => {
        callbacks.onReady!();
        return { sdkView: { width: element.offsetWidth, height: element.offsetHeight } };
      }
    }
    
    return new Promise<string>((resolve) => {
      const onStateChange: GlobalTSec.TencentCaptchaStateChangeFn = (res) => {
        if (res.ret === 0) {
          return callbacks?.onSolve?.(res);
        } 
        
        if(res.errCode || res.errorMessage) {
          return callbacks?.onError?.(new Error(`Captcha error: ${res.errCode} - ${res.errorMessage}`));
        }
      };

      try {
        const captcha = new window.TencentCaptcha(element, this.identifier, onStateChange, renderOptions);
        captcha.show();
        this.widgetMap.set(widgetId, captcha);
      } catch(error) {

      }

      resolve(widgetId);
    });
	}

	reset(widgetId: string) {
    const captcha = this.widgetMap.get(widgetId);
    captcha && captcha.reload();
	}

	async execute(widgetId: string) {
    const captcha = this.widgetMap.get(widgetId);
    captcha && captcha.show();
	}

	destroy(widgetId: string) {
    const captcha = this.widgetMap.get(widgetId);
    captcha && captcha.destroy();
	}

	getResponse(widgetId: string): GlobalTSec.TencentCaptchaResult | null {
    const captcha = this.widgetMap.get(widgetId);
    return captcha ? captcha.getTicket() : null;
	}

	getHandle(widgetId: string): TSecHandle {
    return this.getCommonHandle(widgetId);
	}
}
