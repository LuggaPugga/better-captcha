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

export function createCaptchaComponent<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (sitekeyOrEndpoint: string) => Provider<ProviderConfig, TOptions, THandle>,
	elementName: string = "better-captcha",
) {
	class CaptchaComponent extends LitElement {
		@property() sitekey: string = "";
		@property() endpoint: string = "";
		@property({ type: Object }) options: TOptions | undefined;
		@property({ type: Boolean }) autoRender: boolean = true;

		@state() private captchaState: CaptchaState = {
			loading: true,
			error: null,
			ready: false,
		};

		private elementRef: Ref<HTMLDivElement> = createRef();
		private provider: Provider<ProviderConfig, TOptions, THandle> | null = null;
		private lifecycle: CaptchaLifecycle<TOptions, THandle> | null = null;
		private initialized = false;

		protected createRenderRoot() {
			return this;
		}

		async connectedCallback() {
			super.connectedCallback();
			await this.updateComplete;
			const value = this.endpoint || this.sitekey;
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

		private cleanup() {
			this.lifecycle?.cleanup();
			this.lifecycle = null;
			this.provider = null;
			this.initialized = false;
		}

		private initializeCaptcha() {
			const value = this.endpoint || this.sitekey;
			if (!value || !this.elementRef.value) return;

			this.lifecycle?.cleanup();

			this.provider = new ProviderClass(value);

			this.lifecycle = new CaptchaLifecycle(this.provider, this.options, (state) => {
				this.captchaState = state;
			});
			this.lifecycle.initialize(this.elementRef.value);
		}

		updated(changedProperties: Map<string, unknown>) {
			const value = this.endpoint || this.sitekey;
			if (
				this.initialized &&
				(changedProperties.has("sitekey") || changedProperties.has("endpoint")) &&
				value &&
				this.autoRender
			) {
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

	if (!customElements.get(elementName)) {
		customElements.define(elementName, CaptchaComponent);
	}

	return CaptchaComponent as unknown as CustomElementConstructor & {
		new (): LitElement & { getHandle: () => THandle };
	};
}
