import { Turnstile, type TurnstileHandle } from "@better-captcha/lit/provider/turnstile";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

// Ensure the component is registered
Turnstile;

type TurnstileCaptchaElement = LitElement & { getHandle: () => TurnstileHandle };

@customElement("turnstile-test")
export class TurnstileTest extends LitElement {
	private captchaRef: Ref<TurnstileCaptchaElement> = createRef();

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
				<turnstile-captcha
					${ref(this.captchaRef)}
					sitekey="1x00000000000000000000AA"
					.options=${this.options}
				></turnstile-captcha>
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
		"turnstile-test": TurnstileTest;
	}
}
