<script lang="ts">
	import type { CaptchaState, ProviderName } from "@better-captcha/core";
	import { BetterCaptcha } from "@better-captcha/svelte";
	import type { Component } from "svelte";

	export type CaptchaComponentMode = "dedicated" | "dynamic";

	type Props = {
		mode: CaptchaComponentMode;
		provider: ProviderName;
		component: Component;
		[key: string]: unknown;
	};

	let { mode, provider, component: DedicatedComponent, ...rest }: Props = $props();

	let innerRef = $state<{
		execute(): Promise<void>;
		reset(): void;
		destroy(): void;
		getResponse(): unknown;
		getComponentState(): CaptchaState;
		render(): Promise<void>;
	}>();

	export const execute = () => innerRef?.execute() ?? Promise.resolve();
	export const reset = () => innerRef?.reset();
	export const destroy = () => innerRef?.destroy();
	export const getResponse = () => innerRef?.getResponse();
	export const getComponentState = () =>
		innerRef?.getComponentState() ?? { loading: false, error: null, ready: false };
	export const render = () => innerRef?.render() ?? Promise.resolve();
</script>

{#if mode === "dynamic"}
	<BetterCaptcha bind:this={innerRef} {provider} {...rest} />
{:else}
	<DedicatedComponent bind:this={innerRef} {...rest} />
{/if}
