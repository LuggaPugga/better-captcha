<template>
	<div>
		<h1>Vue Captcha Testing</h1>

		<div>
			<h2>Select Component:</h2>
			<button type="button" @click="componentMode = 'dedicated'">Dedicated Component</button>
			<button type="button" @click="componentMode = 'dynamic'">Dynamic Component</button>
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
			<TurnstileTest v-if="currentProvider === 'turnstile'" :mode="componentMode" />
			<HCaptchaTest v-else-if="currentProvider === 'hcaptcha'" :mode="componentMode" />
			<RecaptchaTest v-else-if="currentProvider === 'recaptcha'" :mode="componentMode" />
			<RecaptchaV3Test v-else-if="currentProvider === 'recaptcha-v3'" :mode="componentMode" />
			<FriendlyCaptchaTest v-else-if="currentProvider === 'friendly-captcha'" :mode="componentMode" />
			<PrivateCaptchaTest v-else-if="currentProvider === 'private-captcha'" :mode="componentMode" />
			<CaptchaFoxTest v-else-if="currentProvider === 'captcha-fox'" :mode="componentMode" />
			<ProsopoTest v-else-if="currentProvider === 'prosopo'" :mode="componentMode" />
			<CapWidgetTest v-else-if="currentProvider === 'cap-widget'" :mode="componentMode" />
			<AltchaTest v-else-if="currentProvider === 'altcha'" :mode="componentMode" />
			<GeetestTest v-else-if="currentProvider === 'geetest'" :mode="componentMode" />
			<TSecTest v-else-if="currentProvider === 't-sec'" :mode="componentMode" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import AltchaTest from "./components/AltchaTest.vue";
	import CapWidgetTest from "./components/CapWidgetTest.vue";
	import CaptchaFoxTest from "./components/CaptchaFoxTest.vue";
	import FriendlyCaptchaTest from "./components/FriendlyCaptchaTest.vue";
	import HCaptchaTest from "./components/HCaptchaTest.vue";
	import PrivateCaptchaTest from "./components/PrivateCaptchaTest.vue";
	import ProsopoTest from "./components/ProsopoTest.vue";
	import RecaptchaTest from "./components/RecaptchaTest.vue";
	import RecaptchaV3Test from "./components/RecaptchaV3Test.vue";
	import TSecTest from "./components/TSecTest.vue";
	import TurnstileTest from "./components/TurnstileTest.vue";
	import GeetestTest from "./components/GeetestTest.vue";

	const currentProvider = ref("turnstile");
	const componentMode = ref<"dedicated" | "dynamic">(
		new URLSearchParams(window.location.search).get("componentMode") === "dynamic" ? "dynamic" : "dedicated",
	);

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
</script>
