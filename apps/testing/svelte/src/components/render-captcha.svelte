<script lang="ts" generics="THandle extends CaptchaHandle<unknown>, TSolve = string">
	import type { CaptchaHandle, CaptchaResponse, CaptchaState, ProviderName, ScriptOptions } from "@better-captcha/core";
	import type { CaptchaComponentMethods } from "@better-captcha/svelte";
	import { BetterCaptcha } from "@better-captcha/svelte";
	import type { CaptchaComponentMode } from "./render-captcha.types";

	type Props = {
		mode: CaptchaComponentMode;
		provider: ProviderName;
		component: any;
		sitekey?: string;
		endpoint?: string;
		options?: unknown;
		scriptOptions?: ScriptOptions;
		class?: string;
		style?: string;
		autoRender?: boolean;
		onready?: (handle: THandle) => void;
		onerror?: (error: Error) => void;
		onSolve?: (token: TSolve) => void;
	};

	let {
		mode,
		provider,
		component: DedicatedComponent,
		sitekey,
		endpoint,
		options,
		scriptOptions,
		class: className,
		style,
		autoRender,
		onready,
		onerror,
		onSolve,
	}: Props = $props();

	let dedicatedRef = $state<CaptchaComponentMethods<THandle>>();
	let dynamicRef = $state<CaptchaComponentMethods<CaptchaHandle<CaptchaResponse>>>();

	const activeRef = $derived(mode === "dynamic" ? dynamicRef : dedicatedRef);

	const dynamicOnReady = $derived(
		onready ? (handle: CaptchaHandle<CaptchaResponse>) => onready(handle as THandle) : undefined,
	);
	const dynamicOnSolve = $derived(onSolve ? (token: string) => onSolve(token as TSolve) : undefined);

	export const execute = () => activeRef?.execute() ?? Promise.resolve();
	export const reset = () => activeRef?.reset();
	export const destroy = () => activeRef?.destroy();
	export const getResponse = (): ReturnType<THandle["getResponse"]> | undefined =>
		activeRef?.getResponse() as ReturnType<THandle["getResponse"]> | undefined;
	export const getComponentState = (): CaptchaState =>
		activeRef?.getComponentState() ?? { loading: false, error: null, ready: false };
	export const render = () => activeRef?.render() ?? Promise.resolve();
</script>

{#if mode === "dynamic"}
	<BetterCaptcha
		bind:this={dynamicRef}
		{provider}
		{sitekey}
		{endpoint}
		options={options as Record<string, unknown> | undefined}
		{scriptOptions}
		class={className}
		{style}
		{autoRender}
		onready={dynamicOnReady}
		{onerror}
		onSolve={dynamicOnSolve}
	/>
{:else}
	<DedicatedComponent
		bind:this={dedicatedRef as never}
		{sitekey}
		{endpoint}
		{options}
		{scriptOptions}
		class={className}
		{style}
		{autoRender}
		{onready}
		{onerror}
		{onSolve}
	/>
{/if}
