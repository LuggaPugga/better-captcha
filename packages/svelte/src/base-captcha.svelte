<script module lang="ts">
	import type { CaptchaHandle, Provider, ProviderConfig } from "@better-captcha/core";

	export type BaseCaptchaProps<
		TOptions,
		THandle extends CaptchaHandle,
		TProvider extends Provider<ProviderConfig, TOptions, THandle>,
	> = {
		providerClass: new (sitekey: string) => TProvider;
		sitekey: string;
		options?: TOptions;
		class?: string;
		style?: string;
		onready?: (handle: THandle) => void;
		onerror?: (error: Error) => void;
	};
</script>

<script lang="ts" generics="TOptions, THandle extends CaptchaHandle, TProvider extends Provider<ProviderConfig, TOptions, THandle>">
	import type { CaptchaState, WidgetId } from "@better-captcha/core";
	import { onDestroy } from "svelte";

	type Props = BaseCaptchaProps<TOptions, THandle, TProvider>;

	let {
		providerClass: ProviderClass,
		sitekey,
		options = undefined,
		class: className = undefined,
		style = undefined,
		onready = undefined,
		onerror = undefined
	}: Props = $props();

	let elementRef = $state<HTMLDivElement | undefined>(undefined);
	let captchaState = $state<CaptchaState>({ loading: true, error: null, ready: false });
	let widgetId = $state<WidgetId | null>(null);
	let handle = $state<(THandle & CaptchaHandle) | null>(null);

	let container: HTMLDivElement | null = null;
	let provider: TProvider | null = null;
	let renderToken = 0;

	function buildFallbackHandle(): THandle & CaptchaHandle {
		return {
			execute: async () => {},
			reset: () => {},
			destroy: () => {},
			getResponse: () => "",
			getComponentState: () => captchaState,
		} as THandle & CaptchaHandle;
	}

	function cleanup(cancelRender = false): void {
		if (cancelRender) {
			renderToken += 1;
		}

		if (provider && widgetId != null) {
			try {
				provider.destroy(widgetId);
			} catch (error) {
				console.warn("[better-captcha] cleanup:", error);
			}
		}

		container?.remove();
		container = null;
		provider = null;
		widgetId = null;
		handle = buildFallbackHandle();
	}

	function buildActiveHandle(): THandle & CaptchaHandle {
		if (!provider || widgetId == null) {
			return buildFallbackHandle();
		}

		const baseHandle = provider.getHandle(widgetId);
		return {
			...baseHandle,
			getComponentState: () => captchaState,
			destroy: () => {
				baseHandle.destroy();
				cleanup(true);
			},
		} as THandle & CaptchaHandle;
	}

	async function renderCaptcha(): Promise<void> {
		const host = elementRef;
		if (!host) return;

		cleanup();

		const token = ++renderToken;
		const activeProvider = new ProviderClass(sitekey);

		captchaState = { loading: true, error: null, ready: false };

		let mountTarget: HTMLDivElement | null = null;

		try {
			await activeProvider.init();
			if (token !== renderToken) return;

			mountTarget = document.createElement("div");
			host.appendChild(mountTarget);

			const id =
				options !== undefined
					? await activeProvider.render(mountTarget, options)
					: await activeProvider.render(mountTarget);
			if (token !== renderToken) {
				mountTarget.remove();
				return;
			}

			provider = activeProvider;
			container = mountTarget;
			widgetId = id ?? null;
			handle = buildActiveHandle();
			captchaState = { loading: false, error: null, ready: true };
			onready?.(handle);
		} catch (error) {
			mountTarget?.remove();
			if (token !== renderToken) return;

			const err = error instanceof Error ? error : new Error(String(error));
			console.error("[better-captcha] render:", err);
			handle = buildFallbackHandle();
			captchaState = { loading: false, error: err, ready: false };
			onerror?.(err);
		}
	}

	export function execute(): Promise<void> {
		return handle?.execute() ?? Promise.resolve();
	}

	export function reset(): void {
		handle?.reset();
	}

	export function destroy(): void {
		handle?.destroy();
	}

	export function getResponse(): string {
		return handle?.getResponse() ?? "";
	}

	export function getComponentState(): CaptchaState {
		return captchaState;
	}

	$effect(() => {
		elementRef;
		sitekey;
		options;
		ProviderClass;
		renderCaptcha();
	});

	onDestroy(() => {
		cleanup(true);
	});

	const elementId = $derived(
		widgetId !== null && widgetId !== undefined ? `better-captcha-${widgetId}` : "better-captcha-loading",
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

