<template>
	<div>
		<h3>Private Captcha Test</h3>
        <form>
		<PrivateCaptcha
			ref="captchaRef"
			sitekey="aaaaaaaabbbbccccddddeeeeeeeeeeee"
			:options="options"
			@ready="onReady"
			@error="onError"
		/>
    </form>
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
import {
	PrivateCaptcha,
	type PrivateCaptchaHandle,
	type RenderParameters,
} from "@better-captcha/vue/provider/private-captcha";
import { ref } from "vue";

const captchaRef = ref<PrivateCaptchaHandle | null>(null);
const response = ref<string | null>(null);
const error = ref<Error | null>(null);

const options = ref<Omit<RenderParameters, "sitekey">>({
	theme: "light",
});

const onReady = (handle: PrivateCaptchaHandle) => {
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
	const currentTheme =
		options.value.theme === "light" || options.value.theme === "dark" ? options.value.theme : "light";
	const currentIndex = themes.indexOf(currentTheme);
	const nextIndex = (currentIndex + 1) % themes.length;
	options.value = { ...options.value, theme: themes[nextIndex] };
};
</script>

