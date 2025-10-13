import { useState } from "react";
import { FriendlyCaptchaTest } from "./FriendlyCaptchaTest";
import { HCaptchaTest } from "./HCaptchaTest";
import { PrivateCaptchaTest } from "./PrivateCaptchaTest";
import { RecaptchaTest } from "./RecaptchaTest";
import { TurnstileTest } from "./TurnstileTest";

export function App() {
	const [currentProvider, setCurrentProvider] = useState("turnstile");

	const providers = [
		{ key: "turnstile", name: "Turnstile", path: "/turnstile" },
		{ key: "hcaptcha", name: "hCaptcha", path: "/hcaptcha" },
		{ key: "recaptcha", name: "reCAPTCHA", path: "/recaptcha" },
		{ key: "friendly-captcha", name: "Friendly Captcha", path: "/friendly-captcha" },
		{ key: "private-captcha", name: "Private Captcha", path: "/private-captcha" },
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
			</div>
		</div>
	);
}

export default App;
