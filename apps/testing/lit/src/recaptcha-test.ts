import { ReCaptcha, type ReCaptchaHandle } from "@better-captcha/lit/provider/recaptcha";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

ReCaptcha;

type ReCaptchaCaptchaElement = LitElement & { getHandle: () => ReCaptchaHandle };

@customElement("recaptcha-test")
export class RecaptchaTest extends LitElement {
	private captchaRef: Ref<ReCaptchaCaptchaElement> = createRef();

	@state()
	private options = {
		theme: "light" as "light" | "dark" | "auto",
		size: "normal" as "normal" | "compact",
	};

	@state()
	private response: string | null = null;

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

	private async handleRender() {
		await this.captchaRef.value?.getHandle()?.render();
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
				<recaptcha-captcha
					${ref(this.captchaRef)}
					sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
					.options=${this.options}
				></recaptcha-captcha>
				<button type="button" @click=${this.handleDestroy}>Destroy</button>
				<button type="button" @click=${this.handleReset}>Reset</button>
				<button type="button" @click=${this.handleExecute}>Execute</button>
				<button type="button" @click=${this.handleRender}>Render</button>
				<button type="button" @click=${this.handleGetResponse}>Get Response</button>
				<button type="button" @click=${this.handleChangeTheme}>Change Theme</button>
				${this.response ? html`<p id="captcha-response">${this.response}</p>` : ""}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"recaptcha-test": RecaptchaTest;
	}
}
