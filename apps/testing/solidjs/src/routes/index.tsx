import { Title } from "@solidjs/meta";
import { clientOnly } from "@solidjs/start";
import { createSignal } from "solid-js";
import { AltchaTest } from "../components/altcha-test";
import { CapWidgetTest } from "../components/cap-widget-test";
import { CaptchaFoxTest } from "../components/captcha-fox-test";
import { FriendlyCaptchaTest } from "../components/friendly-captcha-test";
import { GeetestTest } from "../components/geetest-test";
import { HCaptchaTest } from "../components/hcaptcha-test";
import { PrivateCaptchaTest } from "../components/private-captcha-test";
import { ProsopoTest } from "../components/prosopo-test";
import { RecaptchaTest } from "../components/recaptcha-test";
import { RecaptchaV3Test } from "../components/recaptcha-v3-test";
import type { CaptchaComponentMode } from "../components/render-captcha";
import { TSecTest } from "../components/tsec-test";
import { TurnstileTest } from "../components/turnstile-test";

export default clientOnly(async () => ({ default: Home }), { lazy: true });

export function Home() {
	const [currentProvider, setCurrentProvider] = createSignal("turnstile");
	const [componentMode, setComponentMode] = createSignal<CaptchaComponentMode>(
		new URLSearchParams(window.location.search).get("componentMode") === "dynamic" ? "dynamic" : "dedicated",
	);

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
		<main>
			<Title>Solid Captcha Testing</Title>
			<h1>Solid Captcha Testing</h1>

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
						onClick={() => setCurrentProvider(provider.key)}
						style={{ margin: "5px", padding: "10px" }}
					>
						{provider.name}
					</button>
				))}
			</div>

			<div style={{ "margin-top": "20px" }}>
				{currentProvider() === "turnstile" && <TurnstileTest mode={componentMode()} />}
				{currentProvider() === "hcaptcha" && <HCaptchaTest mode={componentMode()} />}
				{currentProvider() === "recaptcha" && <RecaptchaTest mode={componentMode()} />}
				{currentProvider() === "recaptcha-v3" && <RecaptchaV3Test mode={componentMode()} />}
				{currentProvider() === "friendly-captcha" && <FriendlyCaptchaTest mode={componentMode()} />}
				{currentProvider() === "private-captcha" && <PrivateCaptchaTest mode={componentMode()} />}
				{currentProvider() === "captcha-fox" && <CaptchaFoxTest mode={componentMode()} />}
				{currentProvider() === "prosopo" && <ProsopoTest mode={componentMode()} />}
				{currentProvider() === "cap-widget" && <CapWidgetTest mode={componentMode()} />}
				{currentProvider() === "altcha" && <AltchaTest mode={componentMode()} />}
				{currentProvider() === "geetest" && <GeetestTest mode={componentMode()} />}
				{currentProvider() === "t-sec" && <TSecTest mode={componentMode()} />}
			</div>
		</main>
	);
}
