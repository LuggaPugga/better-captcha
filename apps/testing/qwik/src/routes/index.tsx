import { component$, useSignal } from "@builder.io/qwik";
import { type DocumentHead, useLocation } from "@builder.io/qwik-city";
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

export default component$(() => {
	const currentProvider = useSignal("turnstile");
	const location = useLocation();
	const componentMode: CaptchaComponentMode =
		location.url.searchParams.get("componentMode") === "dynamic" ? "dynamic" : "dedicated";

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
		<>
			<h1>Qwik Captcha Testing</h1>

			<div>
				<h2>Select Component:</h2>
				<p>{componentMode === "dynamic" ? "Dynamic Component" : "Dedicated Component"}</p>
				<h2>Select Provider:</h2>
				{providers.map((provider) => (
					<button
						key={provider.key}
						type="button"
						onClick$={() => {
							currentProvider.value = provider.key;
						}}
						style={{ margin: "5px", padding: "10px" }}
					>
						{provider.name}
					</button>
				))}
			</div>

			<div style={{ "margin-top": "20px" }} id="captcha-container">
				{currentProvider.value === "turnstile" && <TurnstileTest mode={componentMode} />}
				{currentProvider.value === "hcaptcha" && <HCaptchaTest mode={componentMode} />}
				{currentProvider.value === "recaptcha" && <RecaptchaTest mode={componentMode} />}
				{currentProvider.value === "recaptcha-v3" && <RecaptchaV3Test mode={componentMode} />}
				{currentProvider.value === "friendly-captcha" && <FriendlyCaptchaTest mode={componentMode} />}
				{currentProvider.value === "private-captcha" && <PrivateCaptchaTest mode={componentMode} />}
				{currentProvider.value === "captcha-fox" && <CaptchaFoxTest mode={componentMode} />}
				{currentProvider.value === "prosopo" && <ProsopoTest mode={componentMode} />}
				{currentProvider.value === "cap-widget" && <CapWidgetTest mode={componentMode} />}
				{currentProvider.value === "altcha" && <AltchaTest mode={componentMode} />}
				{currentProvider.value === "geetest" && <GeetestTest mode={componentMode} />}
				{currentProvider.value === "t-sec" && <TSecTest mode={componentMode} />}
			</div>
		</>
	);
});

export const head: DocumentHead = {
	title: "Qwik Captcha Testing",
	meta: [
		{
			name: "description",
			content: "Testing Better Captcha with Qwik",
		},
	],
};
