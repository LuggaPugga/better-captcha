import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./turnstile-test.js";
import "./hcaptcha-test.js";
import "./recaptcha-test.js";
import "./friendly-captcha-test.js";
import "./private-captcha-test.js";
import "./captcha-fox-test.js";
import "./prosopo-test.js";

@customElement("app-root")
export class App extends LitElement {
	@state()
	private currentProvider = "turnstile";

	// Disable shadow DOM for compatibility with captcha providers
	protected createRenderRoot() {
		return this;
	}

	private providers = [
		{ key: "turnstile", name: "Turnstile" },
		{ key: "hcaptcha", name: "hCaptcha" },
		{ key: "recaptcha", name: "reCAPTCHA" },
		{ key: "friendly-captcha", name: "Friendly Captcha" },
		{ key: "private-captcha", name: "Private Captcha" },
		{ key: "captcha-fox", name: "Captcha Fox" },
		{ key: "prosopo", name: "Prosopo" },
	];

	render() {
		return html`
			<div>
				<h1>Lit Captcha Testing</h1>

				<div class="provider-buttons">
					<h2>Select Provider:</h2>
					${this.providers.map(
						(provider) => html`
							<button
								type="button"
								@click=${() => {
									this.currentProvider = provider.key;
								}}
								class=${this.currentProvider === provider.key ? "active" : ""}
								style="margin: 5px; padding: 10px;"
							>
								${provider.name}
							</button>
						`,
					)}
				</div>

				<div class="test-container">
					${this.currentProvider === "turnstile" ? html`<turnstile-test></turnstile-test>` : ""}
					${this.currentProvider === "hcaptcha" ? html`<hcaptcha-test></hcaptcha-test>` : ""}
					${this.currentProvider === "recaptcha" ? html`<recaptcha-test></recaptcha-test>` : ""}
					${this.currentProvider === "friendly-captcha" ? html`<friendly-captcha-test></friendly-captcha-test>` : ""}
					${this.currentProvider === "private-captcha" ? html`<private-captcha-test></private-captcha-test>` : ""}
					${this.currentProvider === "captcha-fox" ? html`<captcha-fox-test></captcha-fox-test>` : ""}
					${this.currentProvider === "prosopo" ? html`<prosopo-test></prosopo-test>` : ""}
				</div>
			</div>
		`;
	}

	static styles = css`
		button {
			margin: 5px;
			padding: 10px;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		"app-root": App;
	}
}
