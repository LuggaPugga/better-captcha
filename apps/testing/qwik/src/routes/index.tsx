import { component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CaptchaFoxTest } from "../components/captcha-fox-test";
import { FriendlyCaptchaTest } from "../components/friendly-captcha-test";
import { HCaptchaTest } from "../components/hcaptcha-test";
import { PrivateCaptchaTest } from "../components/private-captcha-test";
import { ProsopoTest } from "../components/prosopo-test";
import { RecaptchaTest } from "../components/recaptcha-test";
import { TurnstileTest } from "../components/turnstile-test";

export default component$(() => {
	const currentProvider = useSignal("turnstile");

	const providers = [
		{ key: "turnstile", name: "Turnstile", path: "/turnstile" },
		{ key: "hcaptcha", name: "hCaptcha", path: "/hcaptcha" },
		{ key: "recaptcha", name: "reCAPTCHA", path: "/recaptcha" },
		{ key: "friendly-captcha", name: "Friendly Captcha", path: "/friendly-captcha" },
		{ key: "private-captcha", name: "Private Captcha", path: "/private-captcha" },
		{ key: "captcha-fox", name: "Captcha Fox", path: "/captcha-fox" },
		{ key: "prosopo", name: "Prosopo", path: "/prosopo" },
	];

	return (
		<>
			<h1>Qwik Captcha Testing</h1>

			<div>
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
				{currentProvider.value === "turnstile" && <TurnstileTest />}
				{currentProvider.value === "hcaptcha" && <HCaptchaTest />}
				{currentProvider.value === "recaptcha" && <RecaptchaTest />}
				{currentProvider.value === "friendly-captcha" && <FriendlyCaptchaTest />}
				{currentProvider.value === "private-captcha" && <PrivateCaptchaTest />}
				{currentProvider.value === "captcha-fox" && <CaptchaFoxTest />}
				{currentProvider.value === "prosopo" && <ProsopoTest />}
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
