import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

type CaptchaElement<THandle> = CustomElementConstructor & {
	new (): LitElement & { getHandle: () => THandle };
};

type CaptchaProvider<TOptions, TResponse, TSolve, THandle extends CaptchaHandle<TResponse>> = Provider<
	ProviderConfig,
	TOptions,
	THandle,
	TResponse,
	TSolve
>;

export type CaptchaProviderClass<TOptions, TResponse, TSolve, THandle extends CaptchaHandle<TResponse>> = new (
	identifier: string,
	scriptOptions?: ScriptOptions,
) => CaptchaProvider<TOptions, TResponse, TSolve, THandle>;

const SYNC_PROPS = new Set(["sitekey", "endpoint", "options", "scriptOptions", "autoRender"]);

export abstract class CaptchaElementBase<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
> extends LitElement {
	@property({ attribute: "sitekey" }) sitekey?: string;
	@property({ attribute: "endpoint" }) endpoint?: string;
	@property({ type: Object }) options: TOptions | undefined;
	@property({ type: Object }) scriptOptions: ScriptOptions | undefined;
	@property({ type: Boolean }) autoRender = true;
	@property({ type: Object }) onReady?: () => void;
	@property({ type: Object }) onSolve?: (token: TSolve) => void;
	@property({ type: Object }) onError?: (error: Error | string) => void;

	@state() protected captchaState: CaptchaState = {
		loading: false,
		error: null,
		ready: false,
	};

	protected elementRef: Ref<HTMLDivElement> = createRef();
	protected controller: CaptchaController<
		TOptions,
		TResponse,
		TSolve,
		THandle,
		CaptchaProvider<TOptions, TResponse, TSolve, THandle>
	> | null = null;

	private unsubscribeState: (() => void) | null = null;

	protected get isLoading(): boolean {
		return this.autoRender ? this.captchaState.loading || !this.captchaState.ready : this.captchaState.loading;
	}

	protected createRenderRoot() {
		return this;
	}

	protected setProviderClass(ProviderClass: CaptchaProviderClass<TOptions, TResponse, TSolve, THandle>) {
		this.clearController();
		this.controller = new CaptchaController((id, script) => new ProviderClass(id, script));
		this.unsubscribeState = this.controller.onStateChange((state) => {
			this.captchaState = state;
		});
	}

	protected clearController() {
		this.unsubscribeState?.();
		this.unsubscribeState = null;
		this.controller?.cleanup();
		this.controller = null;
	}

	connectedCallback() {
		super.connectedCallback();
		void this.updateComplete.then(() => this.syncAndRender());
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.controller?.cleanup();
	}

	protected syncAndRender() {
		const value = this.sitekey || this.endpoint;
		if (!this.isConnected || !value || !this.elementRef.value || !this.controller) return;

		this.controller.attachHost(this.elementRef.value);
		this.controller.setIdentifier(value);
		this.controller.setScriptOptions(this.scriptOptions);
		this.controller.setOptions(this.options);
		this.controller.setCallbacks({
			onReady: () => {
				this.onReady?.();
				this.dispatchEvent(new CustomEvent("ready"));
			},
			onSolve: (token: TSolve) => {
				this.onSolve?.(token);
				this.dispatchEvent(new CustomEvent("solve", { detail: { token } }));
			},
			onError: (error: Error | string) => {
				this.onError?.(error);
				this.dispatchEvent(new CustomEvent("error", { detail: { error } }));
			},
		});

		if (this.autoRender) void this.controller.render();
	}

	protected updated(changedProperties: Map<string, unknown>) {
		if ([...changedProperties.keys()].some((key) => SYNC_PROPS.has(key))) {
			queueMicrotask(() => this.syncAndRender());
		}
	}

	getHandle(): THandle {
		if (!this.controller) throw new Error("Captcha is not ready");
		return this.controller.getHandle();
	}

	protected render() {
		const widgetId = this.controller?.getWidgetId();
		const elementId = widgetId != null ? `better-captcha-${widgetId}` : "better-captcha-loading";

		return html`
			<div
				${ref(this.elementRef)}
				id="${elementId}"
				aria-live="polite"
				aria-busy="${this.isLoading}"
			></div>
		`;
	}
}

export function createCaptchaComponent<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
>(
	ProviderClass: CaptchaProviderClass<TOptions, TResponse, TSolve, THandle>,
	elementName = "better-captcha",
): CaptchaElement<THandle> {
	class CaptchaComponent extends CaptchaElementBase<TOptions, TResponse, TSolve, THandle> {
		constructor() {
			super();
			this.setProviderClass(ProviderClass);
		}
	}

	if (!customElements.get(elementName)) customElements.define(elementName, CaptchaComponent);
	return CaptchaComponent as CaptchaElement<THandle>;
}
