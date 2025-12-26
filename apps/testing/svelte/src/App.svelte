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
	import TurnstileTest from "./components/TurnstileTest.svelte";

	const currentProvider = writable("turnstile");

	const providers = [
		{ key: "turnstile", name: "Turnstile" },
		{ key: "hcaptcha", name: "hCaptcha" },
		{ key: "recaptcha", name: "reCAPTCHA" },
		{ key: "friendly-captcha", name: "Friendly Captcha" },
		{ key: "private-captcha", name: "Private Captcha" },
		{ key: "captcha-fox", name: "Captcha Fox" },
		{ key: "prosopo", name: "Prosopo" },
		{ key: "cap-widget", name: "CapWidget" },
		{ key: "altcha", name: "Altcha" },
	];

	function setProvider(key: string) {
		currentProvider.set(key);
	}
</script>

<div>
	<h1>Svelte Captcha Testing</h1>

	<div>
		<h2>Select Provider:</h2>
		{#each providers as provider}
			<button type="button" onclick={() => setProvider(provider.key)} style="margin: 5px; padding: 10px;">
				{provider.name}
			</button>
		{/each}
	</div>

	<div style="margin-top: 20px">
		{#if $currentProvider === "turnstile"}
			<TurnstileTest />
		{:else if $currentProvider === "hcaptcha"}
			<HCaptchaTest />
		{:else if $currentProvider === "recaptcha"}
			<RecaptchaTest />
		{:else if $currentProvider === "friendly-captcha"}
			<FriendlyCaptchaTest />
		{:else if $currentProvider === "private-captcha"}
			<PrivateCaptchaTest />
		{:else if $currentProvider === "captcha-fox"}
			<CaptchaFoxTest />
		{:else if $currentProvider === "prosopo"}
			<ProsopoTest />
		{:else if $currentProvider === "cap-widget"}
			<CapWidgetTest />
		{:else if $currentProvider === "altcha"}
			<AltchaTest />
		{/if}
	</div>
</div>
