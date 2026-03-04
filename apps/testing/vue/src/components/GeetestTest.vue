<template>
	<div>
		<h3>Geetest Test</h3>
		<Geetest
			ref="captchaRef"
			sitekey="08649cc61c7078689263ebf78225d616"
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
  import { Geetest, type GeetestHandle, type RenderParameters } from "@better-captcha/vue/provider/geetest";
	import { ref } from "vue";

	const captchaRef = ref<GeetestHandle | null>(null);
	const response = ref<ReturnType<GeetestHandle["getResponse"]> | string | null>(false);
	const error = ref<Error | null>(null);
	const solved = ref<boolean>(false);

	const options = ref<Omit<RenderParameters, "captchaId">>({
    language: 'eng',
	});

	const onReady = (handle: GeetestHandle) => {
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

