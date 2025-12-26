<template>
	<div>
		<h3>reCAPTCHA v3 Test</h3>
		<ReCaptchaV3
			ref="captchaRef"
			sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
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
			<button type="button" @click="handleChangeAction">Change Action</button>
		</div>
		<p v-if="response" id="captcha-response">{{ response }}</p>
		<p v-if="error" style="color: red">Error: {{ error.message }}</p>
	</div>
</template>

<script setup lang="ts">
	import { ReCaptchaV3, type ReCaptchaV3Handle, type RenderParameters } from "@better-captcha/vue/provider/recaptcha-v3";
	import { ref } from "vue";

	const captchaRef = ref<ReCaptchaV3Handle | null>(null);
	const response = ref<string | null>(null);
	const error = ref<Error | null>(null);
	const solved = ref<boolean>(false);

	const options = ref<RenderParameters>({
		action: "submit",
	});

	const onReady = (handle: ReCaptchaV3Handle) => {
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

	const handleChangeAction = () => {
		const actions = ["submit", "login", "register"];
		const currentIndex = actions.indexOf(options.value.action);
		const nextIndex = (currentIndex + 1) % actions.length;
		options.value = { action: actions[nextIndex] };
	};
</script>

