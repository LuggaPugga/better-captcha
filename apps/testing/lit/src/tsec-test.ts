import { TSec, type TSecHandle } from "@better-captcha/lit/provider/t-sec";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

TSec;

type TSecCaptchaElement = LitElement & { getHandle: () => TSecHandle };

@customElement("tsec-test")
export class TSecTest extends LitElement {
	private captchaRef: Ref<TSecCaptchaElement> = createRef();

	@state()
	private response: ReturnType<TSecHandle['getResponse']> = null;

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
		const captchaResponse = this.captchaRef.value?.getHandle()?.getResponse() ?? null;
		this.response = captchaResponse;
	}

	render() {
		return html`
			<div>
				<t-sec-captcha
					${ref(this.captchaRef)}
					sitekey="189905409"
					.options=${{ userLanguage: "en" }}
					.onSolve=${this.handleSolve}
				></t-sec-captcha>
				${this.solved ? html`<p id="captcha-solved">Captcha Solved!</p>` : ""}
				<button type="button" @click=${this.handleDestroy}>Destroy</button>
				<button type="button" @click=${this.handleReset}>Reset</button>
				<button type="button" @click=${this.handleExecute}>Execute</button>
				<button type="button" @click=${this.handleRender}>Render</button>
				<button type="button" @click=${this.handleGetResponse}>Get Response</button>
				${this.response ? html`<p id="captcha-response">${JSON.stringify(this.response, null, "\t")}</p>` : ""}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tsec-test": TSecTest;
	}
}
