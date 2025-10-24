import { Prosopo, type ProsopoHandle } from "@better-captcha/lit/provider/prosopo";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

Prosopo;

type ProsopoCaptchaElement = LitElement & { getHandle: () => ProsopoHandle };

@customElement("prosopo-test")
export class ProsopoTest extends LitElement {
	private captchaRef: Ref<ProsopoCaptchaElement> = createRef();

	@state()
	private theme: "light" | "dark" | "auto" = "light";

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

	private handleChangeTheme() {
		const themes = ["light", "dark", "auto"] as const;
		const currentIndex = themes.indexOf(this.theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		this.theme = themes[nextIndex];
	}

	render() {
		const options = {
			theme: this.theme,
			callback: (response: string) => {
				console.log("Prosopo CAPTCHA verified:", response);
				this.response = response;
			},
			"error-callback": (error: Error) => {
				console.error("Prosopo CAPTCHA error:", error);
			},
		};

		return html`
			<div>
				<prosopo-captcha
					${ref(this.captchaRef)}
					sitekey="no_test_site_key"
					.options=${options}
				></prosopo-captcha>
				<button type="button" @click=${this.handleGetResponse}>Get Response</button>
				<button type="button" @click=${this.handleReset}>Reset</button>
				<button type="button" @click=${this.handleExecute}>Execute</button>
				<button type="button" @click=${this.handleRender}>Render</button>
				<button type="button" @click=${this.handleChangeTheme}>Change Theme</button>
				<button type="button" @click=${this.handleDestroy}>Destroy</button>
				${this.response ? html`<p id="captcha-response">${this.response}</p>` : ""}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"prosopo-test": ProsopoTest;
	}
}
