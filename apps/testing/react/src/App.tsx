import { useState } from "react";
import { CapWidgetTest } from "./cap-widget-test";
import { CaptchaFoxTest } from "./captcha-fox-test";
import { FriendlyCaptchaTest } from "./friendly-captcha-test";
import { HCaptchaTest } from "./hcaptcha-test";
import { PrivateCaptchaTest } from "./private-captcha-test";
import { ProsopoTest } from "./prosopo-test";
import { RecaptchaTest } from "./recaptcha-test";
import { TurnstileTest } from "./turnstile-test";

export function App() {
	const [currentProvider, setCurrentProvider] = useState("turnstile");

	const providers = [
		{ key: "turnstile", name: "Turnstile", path: "/turnstile" },
		{ key: "hcaptcha", name: "hCaptcha", path: "/hcaptcha" },
		{ key: "recaptcha", name: "reCAPTCHA", path: "/recaptcha" },
		{ key: "friendly-captcha", name: "Friendly Captcha", path: "/friendly-captcha" },
		{ key: "private-captcha", name: "Private Captcha", path: "/private-captcha" },
		{ key: "captcha-fox", name: "Captcha Fox", path: "/captcha-fox" },
		{ key: "prosopo", name: "Prosopo", path: "/prosopo" },
		{ key: "cap-widget", name: "CapWidget", path: "/cap-widget" },
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
				{currentProvider === "friendly-captcha" && <FriendlyCaptchaTest />}
				{currentProvider === "private-captcha" && <PrivateCaptchaTest />}
				{currentProvider === "captcha-fox" && <CaptchaFoxTest />}
				{currentProvider === "prosopo" && <ProsopoTest />}
				{currentProvider === "cap-widget" && <CapWidgetTest />}
			</div>
		</div>
	);
}

export default App;
