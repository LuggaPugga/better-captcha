<script module lang="ts">
	import type { CaptchaHandle, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";

	export type BaseCaptchaProps<
		TOptions,
		THandle extends CaptchaHandle,
		TProvider extends Provider<ProviderConfig, TOptions, THandle>,
	> = {
		providerClass: new (sitekeyOrEndpoint: string, scriptOptions?: ScriptOptions) => TProvider;
		value: string;
		options?: TOptions;
		scriptOptions?: ScriptOptions;
		class?: string;
		style?: string;
		autoRender?: boolean;
		onready?: (handle: THandle) => void;
		onerror?: (error: Error) => void;
		onSolve?: (token: string) => void;
	};
</script>

<script
	lang="ts"
	generics="TOptions, THandle extends CaptchaHandle, TProvider extends Provider<ProviderConfig, TOptions, THandle>"
>
	import { CaptchaController } from "@better-captcha/core";
	import type { CaptchaState, WidgetId } from "@better-captcha/core";
	import { onMount, onDestroy, untrack } from "svelte";

	type Props = BaseCaptchaProps<TOptions, THandle, TProvider>;

	let {
		providerClass: ProviderClass,
		value,
		options = undefined,
		scriptOptions = undefined,
		class: className = "",
		style = "",
		autoRender = true,
		onready = undefined,
		onerror = undefined,
		onSolve = undefined,
	}: Props = $props();

	let elementRef = $state<HTMLDivElement>();
	let widgetId = $state<WidgetId | null>(null);
	let hasRendered = $state(false);

	let controllerState = $state<CaptchaState>({
		loading: false,
		error: null,
		ready: false,
	});

	const isLoading = $derived(
		autoRender
			? controllerState.loading || !controllerState.ready
			: controllerState.loading,
	);

	const controller = new CaptchaController<TOptions, THandle, TProvider>(
		(id, script) => new ProviderClass(id, script),
	);

	const unsubscribeState = controller.onStateChange((newState) => {
		controllerState = newState;
		widgetId = controller.getWidgetId();
	});

	$effect(() => {
		controller.attachHost(elementRef ?? null);
		controller.setIdentifier(value);
		controller.setScriptOptions(scriptOptions);
		controller.setOptions(options);

		controller.setCallbacks({
			onReady: () => onready?.(controller.getHandle()),
			onSolve: (token: string) => onSolve?.(token),
			onError: (err: Error | string) => {
				const error = err instanceof Error ? err : new Error(String(err));
				onerror?.(error);
			},
		});
	});

	async function renderCaptcha(): Promise<void> {
		await controller.render();
		if (controllerState.ready) {
			hasRendered = true;
		}
	}

	$effect(() => {
		const _trigger = [value, options, scriptOptions];

		untrack(() => {
			if (autoRender && (hasRendered || controllerState.error)) {
				renderCaptcha();
			}
		});
	});

	onMount(() => {
		if (autoRender) void renderCaptcha();
	});

	onDestroy(() => {
		controller.cleanup();
		unsubscribeState();
	});

	export const execute = () => controller.getHandle().execute();
	export const reset = () => controller.getHandle().reset();
	export const destroy = () => {
		if (controller.getWidgetId() != null) {
			controller.cleanup();
			hasRendered = false;
		}
	};
	export const getResponse = () => controller.getHandle().getResponse();
	export const getComponentState = () => controllerState;
	export const render = () => renderCaptcha();

	const elementId = $derived(
		widgetId != null ? `better-captcha-${widgetId}` : "better-captcha-loading",
	);
</script>

<div
	bind:this={elementRef}
	id={elementId}
	class={className}
	{style}
	aria-live="polite"
	aria-busy={isLoading}
></div>