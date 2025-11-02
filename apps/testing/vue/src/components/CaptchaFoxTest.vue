<template>
	<div>
		<h3>Captcha Fox Test</h3>
		<CaptchaFox
			ref="captchaRef"
			sitekey="sk_11111111000000001111111100000000"
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
	import { CaptchaFox, type CaptchaFoxHandle, type RenderParameters } from "@better-captcha/vue/provider/captcha-fox";
	import { ref } from "vue";

	const captchaRef = ref<CaptchaFoxHandle | null>(null);
	const response = ref<string | null>(null);
	const error = ref<Error | null>(null);
	const solved = ref<boolean>(false);

	const options = ref<Omit<RenderParameters, "element" | "sitekey">>({
		lang: "en",
		theme: "light",
	});

	const onReady = (handle: CaptchaFoxHandle) => {
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
		const themes = ["light", "dark"] as const;
		const currentTheme =
			options.value.theme === "light" || options.value.theme === "dark" ? options.value.theme : "light";
		const currentIndex = themes.indexOf(currentTheme);
		const nextIndex = (currentIndex + 1) % themes.length;
		options.value = { ...options.value, theme: themes[nextIndex] };
	};
</script>

