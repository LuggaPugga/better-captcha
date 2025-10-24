import { PrivateCaptcha, type PrivateCaptchaHandle } from "@better-captcha/lit/provider/private-captcha";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

PrivateCaptcha;

type PrivateCaptchaCaptchaElement = LitElement & { getHandle: () => PrivateCaptchaHandle };

@customElement("private-captcha-test")
export class PrivateCaptchaTest extends LitElement {
	private captchaRef: Ref<PrivateCaptchaCaptchaElement> = createRef();

	@state()
	private options = {
		theme: "light" as "light" | "dark" | "auto",
		startMode: "auto" as "auto" | "focus" | "none",
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
				<form>
					<private-captcha-widget
						${ref(this.captchaRef)}
						sitekey="aaaaaaaabbbbccccddddeeeeeeeeeeee"
						.options=${this.options}
					></private-captcha-widget>
				</form>
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
		"private-captcha-test": PrivateCaptchaTest;
	}
}
