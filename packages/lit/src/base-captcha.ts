import type {
	CaptchaCallbacks,
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
} from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

type CaptchaElement<THandle> = CustomElementConstructor & {
	new (): LitElement & { getHandle: () => THandle };
};

export function createCaptchaComponent<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (identifier: string, scriptOptions?: ScriptOptions) => Provider<ProviderConfig, TOptions, THandle>,
	elementName: string = "better-captcha",
): CaptchaElement<THandle> {
	const ProviderClassRef = ProviderClass;

	class CaptchaComponent extends LitElement {
		@property({ attribute: "sitekey" }) sitekey?: string;
		@property({ attribute: "endpoint" }) endpoint?: string;
		@property({ type: Object }) options: TOptions | undefined;
		@property({ type: Object }) scriptOptions: ScriptOptions | undefined;
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
		protected controller: CaptchaController<TOptions, THandle, Provider<ProviderConfig, TOptions, THandle>>;
		protected initialized = false;

		constructor() {
			super();
			this.controller = new CaptchaController<TOptions, THandle, Provider<ProviderConfig, TOptions, THandle>>(
				(id: string, script?: ScriptOptions) => new ProviderClassRef(id, script),
			);
			this.controller.onStateChange((state) => {
				this.captchaState = state;
			});
		}

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
				this.configureController();
				if (this.autoRender) {
					void this.controller.render();
				}
				this.initialized = true;
			}
		}

		disconnectedCallback() {
			super.disconnectedCallback();
			this.cleanup();
		}

		protected cleanup() {
			this.controller.cleanup();
			this.initialized = false;
		}

		protected configureController(): boolean {
			const value = this.getValue();
			if (!value || !this.elementRef.value) return false;

			this.controller.attachHost(this.elementRef.value);
			this.controller.setIdentifier(value);
			this.controller.setScriptOptions(this.scriptOptions);
			this.controller.setOptions(this.options);

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

			this.controller.setCallbacks(callbacks);
			return true;
		}

		protected async initializeCaptcha() {
			if (!this.configureController()) return;
			await this.controller.render();
		}

		updated(changedProperties: Map<string, unknown>) {
			const value = this.getValue();
			const identifierChanged = changedProperties.has("sitekey") || changedProperties.has("endpoint");
			if (this.initialized && identifierChanged && value && this.autoRender) {
				this.cleanup();
				void this.initializeCaptcha();
				this.initialized = true;
			} else if (
				this.initialized &&
				changedProperties.has("options") &&
				changedProperties.get("options") !== undefined &&
				this.autoRender
			) {
				this.cleanup();
				void this.initializeCaptcha();
				this.initialized = true;
			} else if (this.initialized && changedProperties.has("scriptOptions") && this.autoRender) {
				this.cleanup();
				void this.initializeCaptcha();
				this.initialized = true;
			}
		}

		getHandle(): THandle {
			return this.controller.getHandle();
		}

		render() {
			const widgetId = this.controller.getWidgetId();
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
