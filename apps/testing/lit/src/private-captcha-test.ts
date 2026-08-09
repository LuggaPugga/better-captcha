import { PrivateCaptcha, type PrivateCaptchaHandle } from "@better-captcha/lit/provider/private-captcha";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { type CaptchaComponentMode, type CaptchaRefElement, renderCaptcha } from "./render-captcha.js";

PrivateCaptcha;
type PrivateCaptchaCaptchaElement = CaptchaRefElement<PrivateCaptchaHandle>;

@customElement("private-captcha-test")
export class PrivateCaptchaTest extends LitElement {
	@property({ type: String }) mode: CaptchaComponentMode = "dedicated";

	private captchaRef: Ref<PrivateCaptchaCaptchaElement> = createRef();

	@state()
	private options = {
		theme: "light" as "light" | "dark" | "auto",
		startMode: "auto" as "auto" | "focus" | "none",
	};

	@state()
	private response: string | null = null;

	@state()
	private solved = false;

	// Disable shadow DOM for compatibility with captcha providers
	protected createRenderRoot() {
		return this;
	}

	private handleSolve = (token: string) => {
		this.solved = true;
		console.log("Captcha solved with token:", token);
	};

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
				<form>
					${renderCaptcha<string, PrivateCaptchaHandle>({
						mode: this.mode,
						provider: "private-captcha",
						captchaRef: this.captchaRef,
						sitekey: "aaaaaaaabbbbccccddddeeeeeeeeeeee",
						options: this.options,
						onSolve: this.handleSolve,
						dedicated: () => html`
							<private-captcha-widget
								${ref(this.captchaRef)}
								sitekey="aaaaaaaabbbbccccddddeeeeeeeeeeee"
								.options=${this.options}
								.onSolve=${this.handleSolve}
							></private-captcha-widget>
						`,
					})}
				</form>
				${this.solved ? html`<p id="captcha-solved">Captcha Solved!</p>` : ""}
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
		"private-captcha-test": PrivateCaptchaTest;
	}
}
