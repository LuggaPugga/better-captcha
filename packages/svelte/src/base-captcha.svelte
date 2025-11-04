<script module lang="ts">
	import type { CaptchaCallbacks, CaptchaHandle, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";

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
	import { onMount, onDestroy } from "svelte";

	type Props = BaseCaptchaProps<TOptions, THandle, TProvider>;

	const {
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

	let elementRef: HTMLDivElement | undefined = $state();
	let captchaState = $state<CaptchaState>({
		loading: autoRender,
		error: null,
		ready: false,
	});
	let widgetId: WidgetId | null = $state(null);
	let hasRendered = false;

	const controller = new CaptchaController<TOptions, THandle, TProvider>(
		(id: string, script?: ScriptOptions) => new ProviderClass(id, script),
	);

	const unsubscribeState = controller.onStateChange((newState) => {
		captchaState = newState;
		widgetId = controller.getWidgetId();
	});

	$effect(() => {
		controller.attachHost(elementRef ?? null);
	});

	$effect(() => {
		controller.setIdentifier(value);
	});

	$effect(() => {
		controller.setScriptOptions(scriptOptions);
	});

	$effect(() => {
		controller.setOptions(options);
	});

	$effect(() => {
		const callbacks: CaptchaCallbacks = {
			onReady: () => {
				if (onready) {
					onready(controller.getHandle());
				}
			},
			onSolve: (token: string) => {
				onSolve?.(token);
			},
			onError: (err: Error | string) => {
				const error = err instanceof Error ? err : new Error(String(err));
				onerror?.(error);
			},
		};
		controller.setCallbacks(callbacks);
	});

	async function renderCaptcha(): Promise<void> {
		await controller.render();
		widgetId = controller.getWidgetId();
		if (captchaState.ready) {
			hasRendered = true;
		}
	}

	export async function execute(): Promise<void> {
		await controller.getHandle().execute();
	}

	export function reset(): void {
		controller.getHandle().reset();
	}

	export function destroy(): void {
		if (controller.getWidgetId() != null) {
			controller.cleanup();
			hasRendered = false;
		}
	}

	export function getResponse(): string {
		return controller.getHandle().getResponse();
	}

	export function getComponentState(): CaptchaState {
		return captchaState;
	}

	export async function render(): Promise<void> {
		await renderCaptcha();
	}

	onMount(() => {
		if (autoRender) void renderCaptcha();
	});

	let lastRenderKey = $state("");
	$effect(() => {
		const _value = value;
		const _options = options;
		const _scriptOpts = scriptOptions;
		const canRetry = captchaState.error != null;
		const currentKey = `${value}::${JSON.stringify(options)}::${JSON.stringify(scriptOptions)}`;
		
		if (autoRender && (hasRendered || canRetry) && currentKey !== lastRenderKey) {
			lastRenderKey = currentKey;
			queueMicrotask(renderCaptcha);
		}
	});

	onDestroy(() => {
		controller.cleanup();
		unsubscribeState();
	});

	const elementId = $derived(
		widgetId != null
			? `better-captcha-${widgetId}`
			: "better-captcha-loading",
	);
</script>

<div
	bind:this={elementRef}
	id={elementId}
	class={className}
	{style}
	aria-live="polite"
	aria-busy={captchaState.loading}
></div>
