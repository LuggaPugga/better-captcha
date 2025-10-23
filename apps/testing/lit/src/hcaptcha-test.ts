import { HCaptcha, type HCaptchaHandle } from "@better-captcha/lit/provider/hcaptcha";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

HCaptcha;

type HCaptchaCaptchaElement = LitElement & { getHandle: () => HCaptchaHandle };

@customElement("hcaptcha-test")
export class HCaptchaTest extends LitElement {
	private captchaRef: Ref<HCaptchaCaptchaElement> = createRef();

	@state()
	private options = {
		theme: "light" as "light" | "dark" | "auto",
		size: "normal" as "normal" | "compact",
	};

	@state()
	private response: string | null = null;

	// Disable shadow DOM for compatibility with captcha providers
	protected createRenderRoot() {
		return this;
	}

	private handleDestroy() {
		this.captchaRef.value?.getHandle()?.destroy();
	}

	private handleReset() {
		this.captchaRef.value?.getHandle()?.reset();
	}

	private handleExecute() {
		this.captchaRef.value?.getHandle()?.execute();
	}

	private handleGetResponse() {
		const captchaResponse = this.captchaRef.value?.getHandle()?.getResponse() || "No response";
		this.response = captchaResponse;
	}

	private handleChangeTheme() {
		const themes = ["light", "dark", "auto"] as const;
		const currentIndex = themes.indexOf(this.options.theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		this.options = { ...this.options, theme: themes[nextIndex] };
	}

	render() {
		return html`
			<div>
				<hcaptcha-captcha
					${ref(this.captchaRef)}
					sitekey="10000000-ffff-ffff-ffff-000000000001"
					.options=${this.options}
				></hcaptcha-captcha>
				<button type="button" @click=${this.handleDestroy}>Destroy</button>
				<button type="button" @click=${this.handleReset}>Reset</button>
				<button type="button" @click=${this.handleExecute}>Execute</button>
				<button type="button" @click=${this.handleGetResponse}>Get Response</button>
				<button type="button" @click=${this.handleChangeTheme}>Change Theme</button>
				${this.response ? html`<p id="captcha-response">${this.response}</p>` : ""}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"hcaptcha-test": HCaptchaTest;
	}
}
