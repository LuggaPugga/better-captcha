<script lang="ts">
	import type {
		CaptchaHandle,
		CaptchaResponse,
		CaptchaState,
		Provider,
		ProviderConfig,
		ProviderName,
		RuntimeProviderClass,
		ScriptOptions,
	} from "@better-captcha/core";
	import { loadProviderClass } from "@better-captcha/core";
	import BaseCaptcha from "./base-captcha.svelte";
	import type { CaptchaComponentMethods, CaptchaProps } from "./index";

	type Props = CaptchaProps<Record<string, unknown>> & {
		provider: ProviderName | RuntimeProviderClass;
	};

	type DynamicProviderClass = new (
		sitekeyOrEndpoint: string,
		scriptOptions?: ScriptOptions,
	) => Provider<ProviderConfig, Record<string, unknown>, CaptchaHandle<string>, string, string>;

	let {
		provider,
		sitekey = undefined,
		endpoint = undefined,
		options = undefined,
		scriptOptions = undefined,
		class: className = "",
		style = "",
		autoRender = true,
		onready = undefined,
		onerror = undefined,
		onSolve = undefined,
	}: Props = $props();

	let captcha = $state<CaptchaComponentMethods<CaptchaHandle<CaptchaResponse>> | undefined>();
	let ProviderClass = $state<RuntimeProviderClass | null>(null);

	const value = $derived(sitekey ?? endpoint ?? "");

	$effect(() => {
		if (typeof provider !== "string") {
			ProviderClass = provider;
			return;
		}

		let cancelled = false;
		ProviderClass = null;

		void loadProviderClass(provider).then(
			(loaded) => {
				if (!cancelled) ProviderClass = loaded;
			},
			(error: unknown) => {
				if (cancelled) return;
				const err = error instanceof Error ? error : new Error(String(error));
				onerror?.(err);
			},
		);

		return () => {
			cancelled = true;
		};
	});

	export const execute = () => captcha?.execute() ?? Promise.resolve();
	export const reset = () => captcha?.reset();
	export const destroy = () => captcha?.destroy();
	export const getResponse = () => captcha?.getResponse();
	export const getComponentState = (): CaptchaState =>
		captcha?.getComponentState() ?? { loading: false, error: null, ready: false };
	export const render = () => captcha?.render() ?? Promise.resolve();
</script>

{#if ProviderClass}
	<BaseCaptcha
		bind:this={captcha}
		providerClass={ProviderClass as unknown as DynamicProviderClass}
		{value}
		{options}
		{scriptOptions}
		class={className}
		{style}
		{autoRender}
		{onready}
		{onerror}
		{onSolve}
	/>
{:else}
	<div id="better-captcha-loading" class={className} {style} aria-live="polite" aria-busy={true}></div>
{/if}
