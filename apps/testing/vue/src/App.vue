<template>
	<div>
		<h1>Vue Captcha Testing</h1>

		<div>
			<h2>Select Provider:</h2>
			<button
				v-for="provider in providers"
				:key="provider.key"
				type="button"
				@click="currentProvider = provider.key"
				:style="{ margin: '5px', padding: '10px' }"
			>
				{{ provider.name }}
			</button>
		</div>

		<div style="margin-top: 20px">
			<TurnstileTest v-if="currentProvider === 'turnstile'" />
			<HCaptchaTest v-else-if="currentProvider === 'hcaptcha'" />
			<RecaptchaTest v-else-if="currentProvider === 'recaptcha'" />
			<FriendlyCaptchaTest v-else-if="currentProvider === 'friendly-captcha'" />
			<PrivateCaptchaTest v-else-if="currentProvider === 'private-captcha'" />
			<CaptchaFoxTest v-else-if="currentProvider === 'captcha-fox'" />
			<ProsopoTest v-else-if="currentProvider === 'prosopo'" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import CaptchaFoxTest from "./components/CaptchaFoxTest.vue";
	import FriendlyCaptchaTest from "./components/FriendlyCaptchaTest.vue";
	import HCaptchaTest from "./components/HCaptchaTest.vue";
	import PrivateCaptchaTest from "./components/PrivateCaptchaTest.vue";
	import ProsopoTest from "./components/ProsopoTest.vue";
	import RecaptchaTest from "./components/RecaptchaTest.vue";
	import TurnstileTest from "./components/TurnstileTest.vue";

	const currentProvider = ref("turnstile");

	const providers = [
		{ key: "turnstile", name: "Turnstile" },
		{ key: "hcaptcha", name: "hCaptcha" },
		{ key: "recaptcha", name: "reCAPTCHA" },
		{ key: "friendly-captcha", name: "Friendly Captcha" },
		{ key: "private-captcha", name: "Private Captcha" },
		{ key: "captcha-fox", name: "Captcha Fox" },
		{ key: "prosopo", name: "Prosopo" },
	];
</script>

