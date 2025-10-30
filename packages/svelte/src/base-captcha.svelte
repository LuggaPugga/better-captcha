<script module lang="ts">
	import type { CaptchaHandle, Provider, ProviderConfig } from "@better-captcha/core";

	export type BaseCaptchaProps<
		TOptions,
		THandle extends CaptchaHandle,
		TProvider extends Provider<ProviderConfig, TOptions, THandle>,
	> = {
		providerClass: new (sitekeyOrEndpoint: string) => TProvider;
		value: string;
		options?: TOptions;
		class?: string;
		style?: string;
		autoRender?: boolean;
		onready?: (handle: THandle) => void;
		onerror?: (error: Error) => void;
	};
</script>

<script lang="ts" generics="TOptions, THandle extends CaptchaHandle, TProvider extends Provider<ProviderConfig, TOptions, THandle>">
	import type { CaptchaState, WidgetId } from "@better-captcha/core";
	import { cleanup as cleanupWidget } from "@better-captcha/core/utils/lifecycle";
	import { onMount, onDestroy } from "svelte";

	type Props = BaseCaptchaProps<TOptions, THandle, TProvider>;

let {
	providerClass: ProviderClass,
	value,
	options = undefined,
	class: className = undefined,
	style = undefined,
	autoRender = true,
	onready = undefined,
	onerror = undefined
}: Props = $props();

	let elementRef: HTMLDivElement | undefined = $state();
	let captchaState = $state<CaptchaState>({ loading: autoRender, error: null, ready: false });
	let widgetId: WidgetId | null = $state(null);

	let container: HTMLDivElement | null = null;
	let provider: TProvider | null = null;
	let isRendering = false;
let pendingRender = false;

	function cleanup(): void {
		cleanupWidget(provider, widgetId, container);
		container = null;
		provider = null;
		widgetId = null;
	}

	async function renderCaptcha(): Promise<void> {
		const host = elementRef;
	if (!host) return;

	if (isRendering) {
		pendingRender = true;
		return;
	}

		isRendering = true;
	pendingRender = false;
		cleanup();
		captchaState = { loading: true, error: null, ready: false };

	try {
		if (!value) {
			throw new Error("'value' prop must be provided");
		}
		const newProvider = new ProviderClass(value);
			await newProvider.init();

			const newContainer = document.createElement("div");
			host.appendChild(newContainer);

			const id = options !== undefined
				? await newProvider.render(newContainer, options)
				: await newProvider.render(newContainer);

			if (id == null) throw new Error("Captcha render returned null widget id");

			provider = newProvider;
			container = newContainer;
			widgetId = id;
			captchaState = { loading: false, error: null, ready: true };
			hasRendered = true;
			if (onready && provider) {
				const handle = provider.getHandle(id);
				onready(handle);
			}
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			console.error("[better-captcha] render:", err);
			captchaState = { loading: false, error: err, ready: false };
			onerror?.(err);
		} finally {
			isRendering = false;
		if (pendingRender) {
			pendingRender = false;
			queueMicrotask(() => {
				void renderCaptcha();
			});
		}
		}
	}

	export async function execute(): Promise<void> {
		if (provider && widgetId != null) {
			await provider.getHandle(widgetId).execute();
		}
	}

	export function reset(): void {
		if (provider && widgetId != null) {
			provider.getHandle(widgetId).reset();
		}
	}

	export function destroy(): void {
		if (provider && widgetId != null) {
			provider.getHandle(widgetId).destroy();
		}
		cleanup();
		captchaState = { loading: false, error: null, ready: false };
	}

	export function getResponse(): string {
		if (provider && widgetId != null) {
			return provider.getHandle(widgetId).getResponse();
		}
		return "";
	}

	export function getComponentState(): CaptchaState {
		return captchaState;
	}

	export async function render(): Promise<void> {
		await renderCaptcha();
	}

	let hasRendered = false;

	onMount(() => {
		if (autoRender) {
			renderCaptcha();
		}
	});

	$effect(() => {
		value;
		options;
		if (autoRender && hasRendered) {
			renderCaptcha();
		}
	});

	onDestroy(() => {
		cleanup();
	});

	const elementId = $derived(
		widgetId !== null && widgetId !== undefined ? `better-captcha-${widgetId}` : "better-captcha-loading"
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
