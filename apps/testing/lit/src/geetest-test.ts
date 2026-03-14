import { Geetest, type GeetestHandle, type GeetestSolveResponse } from "@better-captcha/lit/provider/geetest";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

Geetest;

type GeetestCaptchaElement = LitElement & { getHandle: () => GeetestHandle };
type GeetestResponse = ReturnType<GeetestHandle["getResponse"]>;

@customElement("geetest-test")
export class GeetestTest extends LitElement {
	private captchaRef: Ref<GeetestCaptchaElement> = createRef();

	@state()
	private options = {
		language: "eng",
	};

	@state()
	private response: GeetestResponse | null = null;

	@state()
	private solved = false;

	protected createRenderRoot() {
		return this;
	}

	private handleSolve = (token: GeetestSolveResponse) => {
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
		const captchaResponse = this.captchaRef.value?.getHandle()?.getResponse() ?? false;
		this.response = captchaResponse;
	}

	render() {
		return html`
			<div>
				<geetest-captcha
					${ref(this.captchaRef)}
					sitekey="647f5ed2ed8acb4be36784e01556bb71"
					.options=${this.options}
					.onSolve=${this.handleSolve}
				></geetest-captcha>
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
		"geetest-test": GeetestTest;
	}
}
