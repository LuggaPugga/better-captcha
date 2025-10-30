import { CapWidget, type CapWidgetHandle } from "@better-captcha/lit/provider/cap-widget";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

// Ensure the component is registered
CapWidget;

type CapWidgetCaptchaElement = LitElement & { getHandle: () => CapWidgetHandle };

@customElement("cap-widget-test")
export class CapWidgetTest extends LitElement {
	private captchaRef: Ref<CapWidgetCaptchaElement> = createRef();

	@state()
	private options = {};

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

	render() {
		return html`
			<div>
				<cap-widget-captcha
					${ref(this.captchaRef)}
					endpoint="https://captcha.gurl.eu.org/api/"
					.options=${this.options}
				></cap-widget-captcha>
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
		"cap-widget-test": CapWidgetTest;
	}
}
