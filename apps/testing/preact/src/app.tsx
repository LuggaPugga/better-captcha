import { useState } from "preact/hooks";
import type { CaptchaComponentMode } from "./render-captcha";
import { AltchaTest } from "./tests/altcha-test";
import { CapWidgetTest } from "./tests/cap-widget-test";
import { CaptchaFoxTest } from "./tests/captcha-fox-test";
import { FriendlyCaptchaTest } from "./tests/friendly-captcha-test";
import { GeetestTest } from "./tests/geetest-test";
import { HCaptchaTest } from "./tests/hcaptcha-test";
import { PrivateCaptchaTest } from "./tests/private-captcha-test";
import { ProsopoTest } from "./tests/prosopo-test";
import { RecaptchaTest } from "./tests/recaptcha-test";
import { RecaptchaV3Test } from "./tests/recaptcha-v3-test";
import { TSecTest } from "./tests/tsec-test";
import { TurnstileTest } from "./tests/turnstile-test";

function getInitialComponentMode(): CaptchaComponentMode {
	return new URLSearchParams(window.location.search).get("componentMode") === "dynamic" ? "dynamic" : "dedicated";
}

export function App() {
	const [currentProvider, setCurrentProvider] = useState("turnstile");
	const [componentMode, setComponentMode] = useState<CaptchaComponentMode>(getInitialComponentMode);

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
		{ key: "geetest", name: "Geetest", path: "/geetest" },
		{ key: "t-sec", name: "T-Sec", path: "/t-sec" },
	];

	return (
		<div>
			<h1>Preact Captcha Testing</h1>

			<div>
				<h2>Select Component:</h2>
				<button type="button" onClick={() => setComponentMode("dedicated")}>
					Dedicated Component
				</button>
				<button type="button" onClick={() => setComponentMode("dynamic")}>
					Dynamic Component
				</button>
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
				{currentProvider === "turnstile" && <TurnstileTest mode={componentMode} />}
				{currentProvider === "hcaptcha" && <HCaptchaTest mode={componentMode} />}
				{currentProvider === "recaptcha" && <RecaptchaTest mode={componentMode} />}
				{currentProvider === "recaptcha-v3" && <RecaptchaV3Test mode={componentMode} />}
				{currentProvider === "friendly-captcha" && <FriendlyCaptchaTest mode={componentMode} />}
				{currentProvider === "private-captcha" && <PrivateCaptchaTest mode={componentMode} />}
				{currentProvider === "captcha-fox" && <CaptchaFoxTest mode={componentMode} />}
				{currentProvider === "prosopo" && <ProsopoTest mode={componentMode} />}
				{currentProvider === "cap-widget" && <CapWidgetTest mode={componentMode} />}
				{currentProvider === "altcha" && <AltchaTest mode={componentMode} />}
				{currentProvider === "geetest" && <GeetestTest mode={componentMode} />}
				{currentProvider === "t-sec" && <TSecTest mode={componentMode} />}
			</div>
		</div>
	);
}
