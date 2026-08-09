<script lang="ts">
	import { writable } from "svelte/store";
	import AltchaTest from "./components/AltchaTest.svelte";
	import CapWidgetTest from "./components/CapWidgetTest.svelte";
	import CaptchaFoxTest from "./components/CaptchaFoxTest.svelte";
	import FriendlyCaptchaTest from "./components/FriendlyCaptchaTest.svelte";
	import HCaptchaTest from "./components/HCaptchaTest.svelte";
	import PrivateCaptchaTest from "./components/PrivateCaptchaTest.svelte";
	import ProsopoTest from "./components/ProsopoTest.svelte";
	import RecaptchaTest from "./components/RecaptchaTest.svelte";
	import RecaptchaV3Test from "./components/RecaptchaV3Test.svelte";
	import TSecTest from "./components/TSecTest.svelte";
	import TurnstileTest from "./components/TurnstileTest.svelte";
	import GeetestTest from "./components/GeetestTest.svelte";
	import type { CaptchaComponentMode } from "./components/render-captcha.types";

	function getInitialComponentMode(): CaptchaComponentMode {
		const mode = new URLSearchParams(window.location.search).get("componentMode");
		return mode === "dynamic" ? "dynamic" : "dedicated";
	}

	const currentProvider = writable("turnstile");
	let componentMode = $state<CaptchaComponentMode>(getInitialComponentMode());

	const providers = [
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

	function setProvider(key: string) {
		currentProvider.set(key);
	}
</script>

<div>
	<h1>Svelte Captcha Testing</h1>

	<div>
		<h2>Select Component:</h2>
		<button type="button" onclick={() => (componentMode = "dedicated")} style="margin: 5px; padding: 10px;">
			Dedicated Component
		</button>
		<button type="button" onclick={() => (componentMode = "dynamic")} style="margin: 5px; padding: 10px;">
			Dynamic Component
		</button>

		<h2>Select Provider:</h2>
		{#each providers as provider}
			<button type="button" onclick={() => setProvider(provider.key)} style="margin: 5px; padding: 10px;">
				{provider.name}
			</button>
		{/each}
	</div>

	<div style="margin-top: 20px">
		{#if $currentProvider === "turnstile"}
			<TurnstileTest mode={componentMode} />
		{:else if $currentProvider === "hcaptcha"}
			<HCaptchaTest mode={componentMode} />
		{:else if $currentProvider === "recaptcha"}
			<RecaptchaTest mode={componentMode} />
		{:else if $currentProvider === "recaptcha-v3"}
			<RecaptchaV3Test mode={componentMode} />
		{:else if $currentProvider === "friendly-captcha"}
			<FriendlyCaptchaTest mode={componentMode} />
		{:else if $currentProvider === "private-captcha"}
			<PrivateCaptchaTest mode={componentMode} />
		{:else if $currentProvider === "captcha-fox"}
			<CaptchaFoxTest mode={componentMode} />
		{:else if $currentProvider === "prosopo"}
			<ProsopoTest mode={componentMode} />
		{:else if $currentProvider === "cap-widget"}
			<CapWidgetTest mode={componentMode} />
		{:else if $currentProvider === "altcha"}
			<AltchaTest mode={componentMode} />
		{:else if $currentProvider === "geetest"}
			<GeetestTest mode={componentMode} />
		{:else if $currentProvider === "t-sec"}
			<TSecTest mode={componentMode} />
		{/if}
	</div>
</div>
