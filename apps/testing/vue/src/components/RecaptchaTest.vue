<template>
	<div>
		<h3>reCAPTCHA Test</h3>
		<ReCaptcha
			ref="captchaRef"
			sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
			:options="options"
			@ready="onReady"
			@error="onError"
		/>
		<div style="margin-top: 10px">
			<button type="button" @click="handleDestroy">Destroy</button>
			<button type="button" @click="handleReset">Reset</button>
			<button type="button" @click="handleExecute">Execute</button>
			<button type="button" @click="handleGetResponse">Get Response</button>
			<button type="button" @click="handleChangeTheme">Change Theme</button>
		</div>
		<p v-if="response" id="captcha-response">{{ response }}</p>
		<p v-if="error" style="color: red">Error: {{ error.message }}</p>
	</div>
</template>

<script setup lang="ts">
import { ReCaptcha, type ReCaptchaHandle, type RenderParameters } from "@better-captcha/vue/provider/recaptcha";
import { ref } from "vue";

const captchaRef = ref<ReCaptchaHandle | null>(null);
const response = ref<string | null>(null);
const error = ref<Error | null>(null);

const options = ref<Omit<RenderParameters, "sitekey">>({
	theme: "light",
	size: "normal",
});

const onReady = (handle: ReCaptchaHandle) => {
	console.log("Captcha ready!", handle);
};

const onError = (err: Error) => {
	error.value = err;
	console.error("Captcha error:", err);
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

const handleGetResponse = () => {
	const captchaResponse = captchaRef.value?.getResponse() || "No response";
	response.value = captchaResponse;
};

const handleChangeTheme = () => {
	const themes = ["light", "dark"] as const;
	const currentIndex = themes.indexOf(options.value.theme || "light");
	const nextIndex = (currentIndex + 1) % themes.length;
	options.value = { ...options.value, theme: themes[nextIndex] };
};
</script>

