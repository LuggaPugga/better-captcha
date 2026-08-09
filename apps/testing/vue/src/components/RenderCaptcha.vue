<template>
	<component
		:is="mode === 'dynamic' ? BetterCaptcha : component"
		ref="captchaRef"
		v-bind="componentProps"
	/>
</template>

<script setup lang="ts">
	import type { CaptchaHandle, CaptchaResponse, CaptchaState, ProviderName } from "@better-captcha/core";
	import { BetterCaptcha } from "@better-captcha/vue";
	import type { Component } from "vue";
	import { computed, ref, useAttrs } from "vue";

	export type CaptchaComponentMode = "dedicated" | "dynamic";

	defineOptions({ inheritAttrs: false });
	const props = defineProps<{
		mode: CaptchaComponentMode;
		provider: ProviderName;
		component: Component;
	}>();
	const attrs = useAttrs();
	const componentProps = computed(() => ({
		...attrs,
		...(props.mode === "dynamic" ? { provider: props.provider } : {}),
	}));

	const captchaRef = ref<CaptchaHandle<CaptchaResponse> | null>(null);

	defineExpose({
		execute: () => captchaRef.value?.execute() ?? Promise.resolve(),
		reset: () => captchaRef.value?.reset(),
		destroy: () => captchaRef.value?.destroy(),
		render: () => captchaRef.value?.render() ?? Promise.resolve(),
		getResponse: () => captchaRef.value?.getResponse(),
		getComponentState: (): CaptchaState =>
			captchaRef.value?.getComponentState() ?? { loading: false, error: null, ready: false },
	});
</script>
