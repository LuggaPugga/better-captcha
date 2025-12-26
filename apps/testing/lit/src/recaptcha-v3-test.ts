import { ReCaptchaV3, type ReCaptchaV3Handle } from "@better-captcha/lit/provider/recaptcha-v3";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

ReCaptchaV3;

type ReCaptchaV3CaptchaElement = LitElement & { getHandle: () => ReCaptchaV3Handle };

@customElement("recaptcha-v3-test")
export class RecaptchaV3Test extends LitElement {
	private captchaRef: Ref<ReCaptchaV3CaptchaElement> = createRef();

	@state()
	private options = {
		action: "submit",
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

	private handleChangeAction() {
		const actions = ["submit", "login", "register"];
		const currentIndex = actions.indexOf(this.options.action);
		const nextIndex = (currentIndex + 1) % actions.length;
		this.options = { action: actions[nextIndex] };
	}

	render() {
		return html`
			<div>
				<recaptcha-v3-captcha
					${ref(this.captchaRef)}
					sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
					.options=${this.options}
					.onSolve=${this.handleSolve}
				></recaptcha-v3-captcha>
				${this.solved ? html`<p id="captcha-solved">Captcha Solved!</p>` : ""}
				<button type="button" @click=${this.handleDestroy}>Destroy</button>
				<button type="button" @click=${this.handleReset}>Reset</button>
				<button type="button" @click=${this.handleExecute}>Execute</button>
				<button type="button" @click=${this.handleRender}>Render</button>
				<button type="button" @click=${this.handleGetResponse}>Get Response</button>
				<button type="button" @click=${this.handleChangeAction}>Change Action</button>
				${this.response ? html`<p id="captcha-response">${this.response}</p>` : ""}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"recaptcha-v3-test": RecaptchaV3Test;
	}
}
