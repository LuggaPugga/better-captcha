import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig } from "@better-captcha/core";
import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { CaptchaLifecycle } from "./use-captcha-lifecycle";

const defaultHandle: CaptchaHandle = {
	execute: async () => {},
	reset: () => {},
	destroy: () => {},
	render: async () => {},
	getResponse: () => "",
	getComponentState: () => ({
		loading: false,
		error: null,
		ready: false,
	}),
};

type ValueProp = "sitekey" | "endpoint";

type CaptchaElement<THandle> = CustomElementConstructor & {
	new (): LitElement & { getHandle: () => THandle };
};

function createCaptchaComponentInternal<TOptions, THandle extends CaptchaHandle, TValue extends ValueProp>(
	ProviderClass: new (sitekeyOrEndpoint: string) => Provider<ProviderConfig, TOptions, THandle>,
	valueProp: TValue,
	elementName: string,
): CaptchaElement<THandle> {
	const valueProperty = valueProp;

	abstract class CaptchaComponentBase extends LitElement {
		@property({ type: Object }) options: TOptions | undefined;
		@property({ type: Boolean }) autoRender: boolean = true;

		@state() protected captchaState: CaptchaState = {
			loading: true,
			error: null,
			ready: false,
		};

		protected elementRef: Ref<HTMLDivElement> = createRef();
		protected provider: Provider<ProviderConfig, TOptions, THandle> | null = null;
		protected lifecycle: CaptchaLifecycle<TOptions, THandle> | null = null;
		protected initialized = false;

		protected abstract getValue(): string;

		protected createRenderRoot() {
			return this;
		}

		async connectedCallback() {
			super.connectedCallback();
			await this.updateComplete;
			const value = this.getValue();
			if (!this.initialized && this.elementRef.value && value) {
				if (this.autoRender) {
					this.initializeCaptcha();
				}
				this.initialized = true;
			}
		}

		disconnectedCallback() {
			super.disconnectedCallback();
			this.cleanup();
		}

		protected cleanup() {
			this.lifecycle?.cleanup();
			this.lifecycle = null;
			this.provider = null;
			this.initialized = false;
		}

		protected initializeCaptcha() {
			const value = this.getValue();
			if (!value || !this.elementRef.value) return;

			this.lifecycle?.cleanup();

			this.provider = new ProviderClass(value);

			this.lifecycle = new CaptchaLifecycle(this.provider, this.options, (state) => {
				this.captchaState = state;
			});
			this.lifecycle.initialize(this.elementRef.value);
		}

		updated(changedProperties: Map<string, unknown>) {
			const value = this.getValue();
			if (this.initialized && changedProperties.has(valueProperty) && value && this.autoRender) {
				this.cleanup();
				this.initializeCaptcha();
				this.initialized = true;
			} else if (
				this.initialized &&
				changedProperties.has("options") &&
				changedProperties.get("options") !== undefined &&
				this.autoRender
			) {
				this.cleanup();
				this.initializeCaptcha();
				this.initialized = true;
			}
		}

		getHandle(): THandle {
			const id = this.lifecycle?.widgetIdRef;
			const handle = id != null && this.provider ? this.provider.getHandle(id) : (defaultHandle as THandle);

			return {
				...handle,
				getComponentState: () => this.captchaState,
				destroy: () => {
					if (id != null) {
						handle.destroy();
						if (this.lifecycle) {
							this.lifecycle.widgetIdRef = null;
						}
						this.captchaState = { ...this.captchaState, ready: false, error: null };
					}
				},
				render: async () => {
					if (this.elementRef.value) {
						this.initializeCaptcha();
					}
				},
			} as THandle;
		}

		render() {
			const widgetId = this.lifecycle?.widgetIdRef;
			const elementId =
				widgetId !== null && widgetId !== undefined ? `better-captcha-${widgetId}` : "better-captcha-loading";

			return html`
				<div
					${ref(this.elementRef)}
					id="${elementId}"
					aria-live="polite"
					aria-busy="${this.captchaState.loading}"
				></div>
			`;
		}
	}

	class SitekeyCaptchaComponent extends CaptchaComponentBase {
		@property({ attribute: "sitekey" }) sitekey: string = "";

		protected getValue(): string {
			return this.sitekey;
		}
	}

	class EndpointCaptchaComponent extends CaptchaComponentBase {
		@property({ attribute: "endpoint" }) endpoint: string = "";

		protected getValue(): string {
			return this.endpoint;
		}
	}

	const ConcreteComponent = valueProp === "sitekey" ? SitekeyCaptchaComponent : EndpointCaptchaComponent;

	if (!customElements.get(elementName)) {
		customElements.define(elementName, ConcreteComponent);
	}

	return ConcreteComponent as unknown as CaptchaElement<THandle>;
}

export function createCaptchaComponent<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (sitekeyOrEndpoint: string) => Provider<ProviderConfig, TOptions, THandle>,
	elementName: string = "better-captcha",
) {
	return createCaptchaComponentInternal(ProviderClass, "sitekey", elementName);
}

export function createCaptchaComponentWithEndpoint<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (sitekeyOrEndpoint: string) => Provider<ProviderConfig, TOptions, THandle>,
	elementName: string = "better-captcha",
) {
	return createCaptchaComponentInternal(ProviderClass, "endpoint", elementName);
}
