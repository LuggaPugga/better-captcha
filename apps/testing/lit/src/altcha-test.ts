import { Altcha, type AltchaHandle } from "@better-captcha/lit/provider/altcha";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

Altcha;

type AltchaCaptchaElement = LitElement & { getHandle: () => AltchaHandle };

@customElement("altcha-test")
export class AltchaTest extends LitElement {
	private captchaRef: Ref<AltchaCaptchaElement> = createRef();

	@state()
	private options = {};

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

	render() {
		return html`
			<div>
				<altcha-captcha
					${ref(this.captchaRef)}
					endpoint="https://eu.altcha.org/api/v1/challenge?apiKey=ckey_c82e4cb6f2f34eb0a99fb3fbc4c9"
					.options=${this.options}
					.onSolve=${this.handleSolve}
				></altcha-captcha>
				${this.solved ? html`<p id="captcha-solved">Captcha Solved!</p>` : ""}
				<button type="button" @click=${this.handleDestroy}>Destroy</button>
				<button type="button" @click=${this.handleReset}>Reset</button>
				<button type="button" @click=${this.handleExecute}>Execute</button>
				<button type="button" @click=${this.handleRender}>Render</button>
				<button type="button" @click=${this.handleGetResponse}>Get Response</button>
				${this.response ? html`<p id="captcha-response">${this.response}</p>` : ""}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"altcha-test": AltchaTest;
	}
}
