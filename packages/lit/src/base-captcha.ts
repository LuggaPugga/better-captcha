import type { CaptchaCallbacks, CaptchaHandle, CaptchaState, Provider, ProviderConfig } from "@better-captcha/core";
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

type CaptchaElement<THandle> = CustomElementConstructor & {
	new (): LitElement & { getHandle: () => THandle };
};

export function createCaptchaComponent<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (identifier: string) => Provider<ProviderConfig, TOptions, THandle>,
	elementName: string = "better-captcha",
): CaptchaElement<THandle> {
	class CaptchaComponent extends LitElement {
		@property({ attribute: "sitekey" }) sitekey?: string;
		@property({ attribute: "endpoint" }) endpoint?: string;
		@property({ type: Object }) options: TOptions | undefined;
		@property({ type: Boolean }) autoRender: boolean = true;
		@property({ type: Object }) onReady?: () => void;
		@property({ type: Object }) onSolve?: (token: string) => void;
		@property({ type: Object }) onError?: (error: Error | string) => void;

		@state() protected captchaState: CaptchaState = {
			loading: true,
			error: null,
			ready: false,
		};

		protected elementRef: Ref<HTMLDivElement> = createRef();
		protected provider: Provider<ProviderConfig, TOptions, THandle> | null = null;
		protected lifecycle: CaptchaLifecycle<TOptions, THandle> | null = null;
		protected initialized = false;

		protected getValue(): string {
			return this.sitekey || this.endpoint || "";
		}

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

			const callbacks: CaptchaCallbacks = {
				onReady: () => {
					this.onReady?.();
					this.dispatchEvent(new CustomEvent("ready"));
				},
				onSolve: (token: string) => {
					this.onSolve?.(token);
					this.dispatchEvent(new CustomEvent("solve", { detail: { token } }));
				},
				onError: (error: Error | string) => {
					this.onError?.(error);
					this.dispatchEvent(new CustomEvent("error", { detail: { error } }));
				},
			};

			this.lifecycle = new CaptchaLifecycle(
				this.provider,
				this.options,
				(state) => {
					this.captchaState = state;
				},
				callbacks,
			);
			this.lifecycle.initialize(this.elementRef.value);
		}

		updated(changedProperties: Map<string, unknown>) {
			const value = this.getValue();
			const identifierChanged = changedProperties.has("sitekey") || changedProperties.has("endpoint");
			if (this.initialized && identifierChanged && value && this.autoRender) {
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

	return CaptchaComponent as unknown as CaptchaElement<THandle>;
}
