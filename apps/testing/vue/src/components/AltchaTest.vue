<template>
	<div>
	<h3>Altcha Test</h3>
		<Altcha
			ref="captchaRef"
			endpoint="https://eu.altcha.org/api/v1/challenge?apiKey=ckey_c82e4cb6f2f34eb0a99fb3fbc4c9"
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
		</div>
		<p v-if="response" id="captcha-response">{{ response }}</p>
		<p v-if="error" style="color: red">Error: {{ error.message }}</p>
	</div>
</template>

<script setup lang="ts">
	import { type RenderParameters, Altcha, type AltchaHandle } from "@better-captcha/vue/provider/altcha";
import { ref } from "vue";

	const captchaRef = ref<AltchaHandle | null>(null);
	const response = ref<string | null>(null);
	const error = ref<Error | null>(null);
	const solved = ref<boolean>(false);

	const options = ref<RenderParameters>({});

	const onReady = (handle: AltchaHandle) => {
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
</script>
