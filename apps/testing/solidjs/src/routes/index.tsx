import { Title } from "@solidjs/meta";
import { clientOnly } from "@solidjs/start";
import { createSignal } from "solid-js";
import { AltchaTest } from "../components/altcha-test";
import { CapWidgetTest } from "../components/cap-widget-test";
import { CaptchaFoxTest } from "../components/captcha-fox-test";
import { FriendlyCaptchaTest } from "../components/friendly-captcha-test";
import { HCaptchaTest } from "../components/hcaptcha-test";
import { PrivateCaptchaTest } from "../components/private-captcha-test";
import { ProsopoTest } from "../components/prosopo-test";
import { RecaptchaTest } from "../components/recaptcha-test";
import { TurnstileTest } from "../components/turnstile-test";

export default clientOnly(async () => ({ default: Home }), { lazy: true });

export function Home() {
	const [currentProvider, setCurrentProvider] = createSignal("turnstile");

	const providers = [
		{ key: "turnstile", name: "Turnstile", path: "/turnstile" },
		{ key: "hcaptcha", name: "hCaptcha", path: "/hcaptcha" },
		{ key: "recaptcha", name: "reCAPTCHA", path: "/recaptcha" },
		{ key: "friendly-captcha", name: "Friendly Captcha", path: "/friendly-captcha" },
		{ key: "private-captcha", name: "Private Captcha", path: "/private-captcha" },
		{ key: "captcha-fox", name: "Captcha Fox", path: "/captcha-fox" },
		{ key: "prosopo", name: "Prosopo", path: "/prosopo" },
		{ key: "cap-widget", name: "CapWidget", path: "/cap-widget" },
		{ key: "altcha", name: "Altcha", path: "/altcha" },
	];

	return (
		<main>
			<Title>Solid Captcha Testing</Title>
			<h1>Solid Captcha Testing</h1>

			<div>
				<h2>Select Provider:</h2>
				{providers.map((provider) => (
					<button
						type="button"
						onClick={() => setCurrentProvider(provider.key)}
						style={{ margin: "5px", padding: "10px" }}
					>
						{provider.name}
					</button>
				))}
			</div>

			<div style={{ "margin-top": "20px" }}>
				{currentProvider() === "turnstile" && <TurnstileTest />}
				{currentProvider() === "hcaptcha" && <HCaptchaTest />}
				{currentProvider() === "recaptcha" && <RecaptchaTest />}
				{currentProvider() === "friendly-captcha" && <FriendlyCaptchaTest />}
				{currentProvider() === "private-captcha" && <PrivateCaptchaTest />}
				{currentProvider() === "captcha-fox" && <CaptchaFoxTest />}
				{currentProvider() === "prosopo" && <ProsopoTest />}
				{currentProvider() === "cap-widget" && <CapWidgetTest />}
				{currentProvider() === "altcha" && <AltchaTest />}
			</div>
		</main>
	);
}
