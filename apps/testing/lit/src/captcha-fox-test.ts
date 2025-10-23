import { CaptchaFox, type CaptchaFoxHandle } from "@better-captcha/lit/provider/captcha-fox";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

CaptchaFox;

type CaptchaFoxCaptchaElement = LitElement & { getHandle: () => CaptchaFoxHandle };

@customElement("captcha-fox-test")
export class CaptchaFoxTest extends LitElement {
	private captchaRef: Ref<CaptchaFoxCaptchaElement> = createRef();

	@state()
	private options = {
		theme: "light" as "light" | "dark" | "auto",
		mode: "inline" as "inline" | "popup",
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
				<captcha-fox-captcha
					${ref(this.captchaRef)}
					sitekey="sk_11111111000000001111111100000000"
					.options=${this.options}
				></captcha-fox-captcha>
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
		"captcha-fox-test": CaptchaFoxTest;
	}
}
