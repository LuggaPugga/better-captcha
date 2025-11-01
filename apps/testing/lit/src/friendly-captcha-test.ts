import { FriendlyCaptcha, type FriendlyCaptchaHandle } from "@better-captcha/lit/provider/friendly-captcha";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

FriendlyCaptcha;

type FriendlyCaptchaCaptchaElement = LitElement & { getHandle: () => FriendlyCaptchaHandle };

@customElement("friendly-captcha-test")
export class FriendlyCaptchaTest extends LitElement {
	private captchaRef: Ref<FriendlyCaptchaCaptchaElement> = createRef();

	@state()
	private options = {
		theme: "light" as "light" | "dark" | "auto",
		startMode: "focus" as "focus" | "auto" | "none",
	};

	@state()
	private response: string | null = null;

	@state()
	private solved = false;

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
				<friendly-captcha
					${ref(this.captchaRef)}
					sitekey="FC-00000000-0000-0000-0000-000000000000"
					.options=${this.options}
					.onSolve=${this.handleSolve}
				></friendly-captcha>
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
		"friendly-captcha-test": FriendlyCaptchaTest;
	}
}
