import type {
	CaptchaHandle,
	CaptchaResponse,
	CaptchaState,
	Provider,
	ProviderConfig,
	ProviderName,
	RuntimeProviderClass,
	ScriptOptions,
} from "@better-captcha/core";
import { CaptchaController, loadProviderClass } from "@better-captcha/core";
import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

type DynamicProvider = Provider<
	ProviderConfig,
	Record<string, unknown>,
	CaptchaHandle<CaptchaResponse>,
	CaptchaResponse,
	CaptchaResponse
>;

const SYNC_PROPS = new Set(["sitekey", "endpoint", "options", "scriptOptions", "autoRender"]);

export class BetterCaptcha extends LitElement {
	@property() provider?: ProviderName;
	@property({ attribute: false }) providerClass?: RuntimeProviderClass;
	@property({ attribute: "sitekey" }) sitekey?: string;
	@property({ attribute: "endpoint" }) endpoint?: string;
	@property({ type: Object }) options: Record<string, unknown> | undefined;
	@property({ type: Object }) scriptOptions: ScriptOptions | undefined;
	@property({ type: Boolean }) autoRender: boolean = true;
	@property({ type: Object }) onReady?: () => void;
	@property({ type: Object }) onSolve?: (token: CaptchaResponse) => void;
	@property({ type: Object }) onError?: (error: Error | string) => void;

	@state() protected captchaState: CaptchaState = {
		loading: false,
		error: null,
		ready: false,
	};

	@state() private activeProviderClass: RuntimeProviderClass | null = null;

	protected elementRef: Ref<HTMLDivElement> = createRef();
	protected controller: CaptchaController<
		Record<string, unknown>,
		CaptchaResponse,
		CaptchaResponse,
		CaptchaHandle<CaptchaResponse>,
		DynamicProvider
	> | null = null;

	private unsubscribeState: (() => void) | null = null;
	private loadToken = 0;

	protected get isLoading(): boolean {
		return this.autoRender ? this.captchaState.loading || !this.captchaState.ready : this.captchaState.loading;
	}

	protected createRenderRoot() {
		return this;
	}

	async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;
		await this.resolveProviderClass();
		this.syncAndRender();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.loadToken++;
		this.teardownController();
	}

	private teardownController() {
		this.unsubscribeState?.();
		this.unsubscribeState = null;
		this.controller?.cleanup();
		this.controller = null;
	}

	private initController(ProviderClass: RuntimeProviderClass) {
		this.teardownController();

		this.controller = new CaptchaController<
			Record<string, unknown>,
			CaptchaResponse,
			CaptchaResponse,
			CaptchaHandle<CaptchaResponse>,
			DynamicProvider
		>((id, script) => new ProviderClass(id, script) as DynamicProvider);

		this.unsubscribeState = this.controller.onStateChange((state) => {
			this.captchaState = state;
		});
	}

	private async resolveProviderClass() {
		if (this.providerClass) {
			this.activeProviderClass = this.providerClass;
			this.initController(this.providerClass);
			return;
		}

		if (!this.provider) {
			this.activeProviderClass = null;
			this.teardownController();
			return;
		}

		const token = ++this.loadToken;
		this.activeProviderClass = null;
		this.teardownController();

		try {
			const ProviderClass = await loadProviderClass(this.provider);
			if (token !== this.loadToken) return;
			this.activeProviderClass = ProviderClass;
			this.initController(ProviderClass);
			this.syncAndRender();
			this.requestUpdate();
		} catch (error) {
			if (token !== this.loadToken) return;
			const err = error instanceof Error ? error : new Error(String(error));
			this.onError?.(err);
			this.dispatchEvent(new CustomEvent("error", { detail: { error: err } }));
		}
	}

	protected getValue(): string {
		return this.sitekey || this.endpoint || "";
	}

	protected configureController(): boolean {
		if (!this.controller) return false;

		const value = this.getValue();
		if (!value || !this.elementRef.value) return false;

		this.controller.attachHost(this.elementRef.value);
		this.controller.setIdentifier(value);
		this.controller.setScriptOptions(this.scriptOptions);
		this.controller.setOptions(this.options);

		this.controller.setCallbacks({
			onReady: () => {
				this.onReady?.();
				this.dispatchEvent(new CustomEvent("ready"));
			},
			onSolve: (token: CaptchaResponse) => {
				this.onSolve?.(token);
				this.dispatchEvent(new CustomEvent("solve", { detail: { token } }));
			},
			onError: (error: Error | string) => {
				this.onError?.(error);
				this.dispatchEvent(new CustomEvent("error", { detail: { error } }));
			},
		});

		return true;
	}

	protected syncAndRender() {
		if (!this.activeProviderClass) return;
		if (!this.configureController()) return;
		if (this.autoRender) {
			void this.controller?.render();
		}
	}

	async updated(changedProperties: Map<string, unknown>) {
		if (changedProperties.has("provider") || changedProperties.has("providerClass")) {
			await this.resolveProviderClass();
			this.syncAndRender();
			return;
		}

		if (![...changedProperties.keys()].some((key) => SYNC_PROPS.has(key))) return;
		this.syncAndRender();
	}

	getHandle(): CaptchaHandle<CaptchaResponse> {
		if (!this.controller) {
			throw new Error("Captcha is not ready");
		}

		return this.controller.getHandle();
	}

	render() {
		if (!this.activeProviderClass) {
			return html`
				<div id="better-captcha-loading" aria-live="polite" aria-busy="true"></div>
			`;
		}

		const widgetId = this.controller?.getWidgetId();
		const elementId = widgetId != null ? `better-captcha-${widgetId}` : "better-captcha-loading";

		return html`
			<div ${ref(this.elementRef)} id="${elementId}" aria-live="polite" aria-busy="${this.isLoading}"></div>
		`;
	}
}

if (!customElements.get("better-captcha")) {
	customElements.define("better-captcha", BetterCaptcha);
}

declare global {
	interface HTMLElementTagNameMap {
		"better-captcha": BetterCaptcha;
	}
}
