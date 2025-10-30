<template>
	<div>
	<h3>CapWidget Test</h3>
		<CapWidget
			ref="captchaRef"
			endpoint="https://captcha.gurl.eu.org/api/"
			:options="options"
			@ready="onReady"
			@error="onError"
		/>
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
	import { type RenderParameters, CapWidget, type CapWidgetHandle } from "@better-captcha/vue/provider/cap-widget";
import { ref } from "vue";

	const captchaRef = ref<CapWidgetHandle | null>(null);
	const response = ref<string | null>(null);
	const error = ref<Error | null>(null);

	const options = ref<RenderParameters>({});

	const onReady = (handle: CapWidgetHandle) => {
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

	const handleRender = async () => {
		await captchaRef.value?.render();
	};

	const handleGetResponse = () => {
		const captchaResponse = captchaRef.value?.getResponse() || "No response";
		response.value = captchaResponse;
	};
</script>

