<template>
	<div>
		<h3>Turnstile Test</h3>
		<Turnstile
			ref="captchaRef"
			sitekey="1x00000000000000000000AA"
			:options="options"
			@ready="onReady"
			@error="onError"
			@solve="onSolve"
		/>
		<p v-if="solved" id="captcha-solved">Captcha Solved!</p>
		<div style="margin-top: 10px">
			<button type="button" @click="handleDestroy">Destroy</button>
			<button type="button" @click="handleReset">Reset</button>
			<button type="button" @click="handleExecute">Execute</button>
			<button type="button" @click="handleRender">Render</button>
			<button type="button" @click="handleGetResponse">Get Response</button>
			<button type="button" @click="handleChangeTheme">Change Theme</button>
		</div>
		<p v-if="response" id="captcha-response">{{ response }}</p>
		<p v-if="error" style="color: red">Error: {{ error.message }}</p>
	</div>
</template>

<script setup lang="ts">
	import { type RenderParameters, Turnstile, type TurnstileHandle } from "@better-captcha/vue/provider/turnstile";
import { ref } from "vue";

	const captchaRef = ref<TurnstileHandle | null>(null);
	const response = ref<string | null>(null);
	const error = ref<Error | null>(null);
	const solved = ref<boolean>(false);

	const options = ref<Omit<RenderParameters, "sitekey">>({
		theme: "light",
		size: "normal",
	});

	const onReady = (handle: TurnstileHandle) => {
		console.log("Captcha ready!", handle);
	};

	const onError = (err: Error) => {
		error.value = err;
		console.error("Captcha error:", err);
	};

	const onSolve = (token: string) => {
		solved.value = true;
		console.log("Captcha solved with token:", token);
	};

	const handleDestroy = () => {
		captchaRef.value?.destroy();
	};

	const handleReset = () => {
		captchaRef.value?.reset();
		response.value = null;
	};

	const handleExecute = async () => {
		await captchaRef.value?.execute();
	};

	const handleRender = async () => {
		await captchaRef.value?.render();
	};

	const handleGetResponse = () => {
		const captchaResponse = captchaRef.value?.getResponse() || "No response";
		response.value = captchaResponse;
	};

	const handleChangeTheme = () => {
		const themes = ["light", "dark", "auto"] as const;
		const currentIndex = themes.indexOf(options.value.theme || "auto");
		const nextIndex = (currentIndex + 1) % themes.length;
		options.value = { ...options.value, theme: themes[nextIndex] };
	};
</script>

