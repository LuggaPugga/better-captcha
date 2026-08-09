import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./altcha-test.js";
import "./turnstile-test.js";
import "./hcaptcha-test.js";
import "./recaptcha-test.js";
import "./recaptcha-v3-test.js";
import "./friendly-captcha-test.js";
import "./private-captcha-test.js";
import "./captcha-fox-test.js";
import "./prosopo-test.js";
import "./cap-widget-test.js";
import "./geetest-test.js";
import "./tsec-test.js";

function getInitialComponentMode(): "dedicated" | "dynamic" {
	const mode = new URLSearchParams(window.location.search).get("componentMode");
	return mode === "dynamic" ? "dynamic" : "dedicated";
}

@customElement("app-root")
export class App extends LitElement {
	@state()
	private currentProvider = "turnstile";

	@state()
	private componentMode: "dedicated" | "dynamic" = getInitialComponentMode();

	// Disable shadow DOM for compatibility with captcha providers
	protected createRenderRoot() {
		return this;
	}

	private providers = [
		{ key: "turnstile", name: "Turnstile" },
		{ key: "hcaptcha", name: "hCaptcha" },
		{ key: "recaptcha", name: "reCAPTCHA" },
		{ key: "recaptcha-v3", name: "reCAPTCHA v3" },
		{ key: "friendly-captcha", name: "Friendly Captcha" },
		{ key: "private-captcha", name: "Private Captcha" },
		{ key: "captcha-fox", name: "Captcha Fox" },
		{ key: "prosopo", name: "Prosopo" },
		{ key: "cap-widget", name: "CapWidget" },
		{ key: "altcha", name: "Altcha" },
		{ key: "geetest", name: "Geetest" },
		{ key: "t-sec", name: "T-Sec" },
	];

	render() {
		return html`
			<div>
				<h1>Lit Captcha Testing</h1>

				<div class="provider-buttons">
					<h2>Select Component:</h2>
					<button
						type="button"
						@click=${() => {
							this.componentMode = "dedicated";
						}}
						style="margin: 5px; padding: 10px;"
					>
						Dedicated Component
					</button>
					<button
						type="button"
						@click=${() => {
							this.componentMode = "dynamic";
						}}
						style="margin: 5px; padding: 10px;"
					>
						Dynamic Component
					</button>

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
					${this.currentProvider === "turnstile" ? html`<turnstile-test .mode=${this.componentMode}></turnstile-test>` : ""}
					${this.currentProvider === "hcaptcha" ? html`<hcaptcha-test .mode=${this.componentMode}></hcaptcha-test>` : ""}
					${this.currentProvider === "recaptcha" ? html`<recaptcha-test .mode=${this.componentMode}></recaptcha-test>` : ""}
					${this.currentProvider === "recaptcha-v3" ? html`<recaptcha-v3-test .mode=${this.componentMode}></recaptcha-v3-test>` : ""}
					${this.currentProvider === "friendly-captcha" ? html`<friendly-captcha-test .mode=${this.componentMode}></friendly-captcha-test>` : ""}
					${this.currentProvider === "private-captcha" ? html`<private-captcha-test .mode=${this.componentMode}></private-captcha-test>` : ""}
					${this.currentProvider === "captcha-fox" ? html`<captcha-fox-test .mode=${this.componentMode}></captcha-fox-test>` : ""}
					${this.currentProvider === "prosopo" ? html`<prosopo-test .mode=${this.componentMode}></prosopo-test>` : ""}
					${this.currentProvider === "cap-widget" ? html`<cap-widget-test .mode=${this.componentMode}></cap-widget-test>` : ""}
					${this.currentProvider === "altcha" ? html`<altcha-test .mode=${this.componentMode}></altcha-test>` : ""}
					${this.currentProvider === "geetest" ? html`<geetest-test .mode=${this.componentMode}></geetest-test>` : ""}
					${this.currentProvider === "t-sec" ? html`<tsec-test .mode=${this.componentMode}></tsec-test>` : ""}
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
