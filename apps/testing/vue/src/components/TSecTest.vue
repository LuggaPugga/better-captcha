<template>
	<div>
		<h3>T-Sec Test</h3>
		<TSec ref="captchaRef" sitekey="189905409" :options="options" @ready="onReady" @error="onError" @solve="onSolve" />
		<p v-if="solved" id="captcha-solved">Captcha Solved!</p>
		<div style="margin-top: 10px">
			<button type="button" @click="handleDestroy">Destroy</button>
			<button type="button" @click="handleReset">Reset</button>
			<button type="button" @click="handleExecute">Execute</button>
			<button type="button" @click="handleRender">Render</button>
			<button type="button" @click="handleGetResponse">Get Response</button>
		</div>
		<p v-if="response" id="captcha-response">{{ JSON.stringify(response, null, "\t") }}</p>
		<p v-if="error" style="color: red">Error: {{ error.message }}</p>
	</div>
</template>

<script setup lang="ts">
import { TSec, type TSecHandle, type RenderParameters} from "@better-captcha/vue/provider/t-sec";
	import { ref } from "vue";

	const captchaRef = ref<TSecHandle | null>(null);
	const response = ref<ReturnType<TSecHandle["getResponse"]>>(null);
	const error = ref<Error | null>(null);
	const solved = ref<boolean>(false);

  const options = ref<RenderParameters>({
    userLanguage: "en",
  });

	const onReady = (handle: TSecHandle) => {
		console.log("Captcha ready!", handle);
	};

	const onError = (err: Error) => {
		error.value = err;
		console.error("Captcha error:", err);
	};

	const onSolve = (token: ReturnType<TSecHandle['getResponse']>) => {
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
		const captchaResponse = captchaRef.value?.getResponse() ?? null;
		response.value = captchaResponse;
	};
</script>
