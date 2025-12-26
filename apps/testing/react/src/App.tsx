import { useState } from "react";
import { AltchaTest } from "./altcha-test";
import { CapWidgetTest } from "./cap-widget-test";
import { CaptchaFoxTest } from "./captcha-fox-test";
import { FriendlyCaptchaTest } from "./friendly-captcha-test";
import { HCaptchaTest } from "./hcaptcha-test";
import { PrivateCaptchaTest } from "./private-captcha-test";
import { ProsopoTest } from "./prosopo-test";
import { RecaptchaTest } from "./recaptcha-test";
import { RecaptchaV3Test } from "./recaptcha-v3-test";
import { TurnstileTest } from "./turnstile-test";

export function App() {
	const [currentProvider, setCurrentProvider] = useState("turnstile");

	const providers = [
		{ key: "turnstile", name: "Turnstile", path: "/turnstile" },
		{ key: "hcaptcha", name: "hCaptcha", path: "/hcaptcha" },
		{ key: "recaptcha", name: "reCAPTCHA", path: "/recaptcha" },
		{ key: "recaptcha-v3", name: "reCAPTCHA v3", path: "/recaptcha-v3" },
		{ key: "friendly-captcha", name: "Friendly Captcha", path: "/friendly-captcha" },
		{ key: "private-captcha", name: "Private Captcha", path: "/private-captcha" },
		{ key: "captcha-fox", name: "Captcha Fox", path: "/captcha-fox" },
		{ key: "prosopo", name: "Prosopo", path: "/prosopo" },
		{ key: "cap-widget", name: "CapWidget", path: "/cap-widget" },
		{ key: "altcha", name: "Altcha", path: "/altcha" },
	];

	return (
		<div>
			<h1>React Captcha Testing</h1>

			<div>
				<h2>Select Provider:</h2>
				{providers.map((provider) => (
					<button
						type="button"
						key={provider.key}
						onClick={() => setCurrentProvider(provider.key)}
						style={{ margin: "5px", padding: "10px" }}
					>
						{provider.name}
					</button>
				))}
			</div>

			<div style={{ marginTop: "20px" }}>
				{currentProvider === "turnstile" && <TurnstileTest />}
				{currentProvider === "hcaptcha" && <HCaptchaTest />}
				{currentProvider === "recaptcha" && <RecaptchaTest />}
				{currentProvider === "recaptcha-v3" && <RecaptchaV3Test />}
				{currentProvider === "friendly-captcha" && <FriendlyCaptchaTest />}
				{currentProvider === "private-captcha" && <PrivateCaptchaTest />}
				{currentProvider === "captcha-fox" && <CaptchaFoxTest />}
				{currentProvider === "prosopo" && <ProsopoTest />}
				{currentProvider === "cap-widget" && <CapWidgetTest />}
				{currentProvider === "altcha" && <AltchaTest />}
			</div>
		</div>
	);
}

export default App;
