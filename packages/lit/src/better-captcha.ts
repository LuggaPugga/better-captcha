import type { CaptchaHandle, CaptchaResponse, ProviderName, RuntimeProviderClass } from "@better-captcha/core";
import { loadProviderClass } from "@better-captcha/core";
import { property } from "lit/decorators.js";
import { CaptchaElementBase, type CaptchaProviderClass } from "./base-captcha";

type DynamicHandle = CaptchaHandle<CaptchaResponse>;
type DynamicProviderClass = CaptchaProviderClass<
	Record<string, unknown>,
	CaptchaResponse,
	CaptchaResponse,
	DynamicHandle
>;

export class BetterCaptcha extends CaptchaElementBase<
	Record<string, unknown>,
	CaptchaResponse,
	CaptchaResponse,
	DynamicHandle
> {
	@property() provider?: ProviderName;
	@property({ attribute: false }) providerClass?: RuntimeProviderClass;

	private loadToken = 0;

	connectedCallback() {
		super.connectedCallback();
		if (this.hasUpdated && !this.controller) void this.resolveProviderClass();
	}

	disconnectedCallback() {
		this.loadToken++;
		super.disconnectedCallback();
	}

	private async resolveProviderClass() {
		const token = ++this.loadToken;
		this.clearController();

		if (!this.providerClass && !this.provider) {
			this.requestUpdate();
			return;
		}

		try {
			const ProviderClass = this.providerClass ?? (await loadProviderClass(this.provider as ProviderName));
			if (token !== this.loadToken) return;

			this.setProviderClass(ProviderClass as unknown as DynamicProviderClass);
			this.requestUpdate();
			await this.updateComplete;
			if (token === this.loadToken) this.syncAndRender();
		} catch (error) {
			if (token !== this.loadToken) return;
			const normalized = error instanceof Error ? error : new Error(String(error));
			this.onError?.(normalized);
			this.dispatchEvent(new CustomEvent("error", { detail: { error: normalized } }));
		}
	}

	protected updated(changedProperties: Map<string, unknown>) {
		super.updated(changedProperties);
		if (changedProperties.has("provider") || changedProperties.has("providerClass")) {
			void this.resolveProviderClass();
		}
	}
}

if (!customElements.get("better-captcha")) customElements.define("better-captcha", BetterCaptcha);

declare global {
	interface HTMLElementTagNameMap {
		"better-captcha": BetterCaptcha;
	}
}
