import type { CaptchaCallbacks, CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";
import { cleanup } from "@better-captcha/core/utils/lifecycle";
import type { NoSerialize, QRL } from "@builder.io/qwik";
import { $, component$, noSerialize, useComputed$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import type { CaptchaProps } from "./index";

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(providerFactory$: QRL<(identifier: string) => TProvider>) {
	return component$<CaptchaProps<TOptions, THandle>>((props) => {
		const hostEl = useSignal<HTMLDivElement | null>(null);
		const provider = useSignal<TProvider | null>(null);
		const widgetId = useSignal<WidgetId | null>(null);
		const containerEl = useSignal<HTMLDivElement | null>(null);
		const state = useSignal<CaptchaState>({ loading: true, error: null, ready: false });
		const isRendering = useSignal(false);
		const hasEmittedReady = useSignal(false);
		const hasEmittedError = useSignal(false);

		const identifier = useComputed$(() => (props as any).sitekey || (props as any).endpoint);

		const cleanup$ = $(() => {
			cleanup(provider.value, widgetId.value, containerEl.value);
			containerEl.value = null;
			widgetId.value = null;
			provider.value = null;
		});

		const renderCaptcha$ = $(async () => {
			const el = hostEl.value;
			if (!el || isRendering.value) return;

			isRendering.value = true;
			await cleanup$();
			state.value = { loading: true, error: null, ready: false };
			hasEmittedReady.value = false;
			hasEmittedError.value = false;
			let resolveRender!: (success: boolean) => void;
			const renderComplete = new Promise<boolean>((resolve) => {
				resolveRender = resolve;
			});
			try {
				const currentValue = identifier.value;
				if (!currentValue) {
					throw new Error("Either 'sitekey' or 'endpoint' prop must be provided");
				}
				const newProvider = await providerFactory$(currentValue);
				await newProvider.init();

				const container = document.createElement("div");
				el.appendChild(container);
				containerEl.value = container;

				const callbacks: CaptchaCallbacks = {
					onReady: async () => {
						if (!props.onReady$ || hasEmittedReady.value) return;
						const success = await renderComplete;
						if (!success) return;
						hasEmittedReady.value = true;
						await props.onReady$(await buildHandle$());
					},
					onSolve: async (token: string) => {
						const onSolve$ = props.onSolve$;
						if (onSolve$) await onSolve$(token);
					},
					onError: async (err: Error | string) => {
						const onError$ = props.onError$;
						if (onError$ && !hasEmittedError.value) {
							hasEmittedError.value = true;
							const error = err instanceof Error ? err : new Error(String(err));
							await onError$(error);
						}
					},
				};

				const id = await newProvider.render(container, props.options, callbacks);
				if (id == null) throw new Error("Captcha render returned null widget id");

				provider.value = newProvider;
				widgetId.value = id;
				state.value = { loading: false, error: null, ready: true };
				resolveRender(true);
				if (props.onReady$ && !hasEmittedReady.value) {
					hasEmittedReady.value = true;
					await props.onReady$(await buildHandle$());
				}
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				console.error("[better-captcha] render:", error);
				state.value = { loading: false, error, ready: false };
				if (props.onError$ && !hasEmittedError.value) {
					hasEmittedError.value = true;
					await props.onError$(error);
				}
				resolveRender(false);
			} finally {
				resolveRender = null!;
				isRendering.value = false;
			}
		});

		const buildHandle$ = $((): NoSerialize<THandle> => {
			const p = provider.value;
			const id = widgetId.value;

			if (!p || id == null) {
				return noSerialize({
					execute: async () => {},
					reset: () => {},
					destroy: () => {},
					render: async () => {
						await renderCaptcha$();
					},
					getResponse: () => "",
					getComponentState: () => state.value,
				} as THandle);
			}

			const base = p.getHandle(id) as THandle;
			return noSerialize({
				...base,
				destroy: () => {
					base.destroy();
					cleanup(provider.value, widgetId.value, containerEl.value);
					containerEl.value = null;
					widgetId.value = null;
					provider.value = null;
					state.value = { loading: false, error: null, ready: false };
				},
				render: async () => {
					await renderCaptcha$();
				},
				getComponentState: () => state.value,
			} as THandle);
		});

		useVisibleTask$(async ({ track, cleanup }) => {
			track(() => hostEl.value);
			track(() => identifier.value);
			track(() => props.options);

			if (!hostEl.value) return;
			if (!identifier.value) return;

			if (props.autoRender ?? true) {
				await renderCaptcha$();
			}

			cleanup(async () => {
				await cleanup$();
			});
		});

		useTask$(async ({ track }) => {
			track(() => provider.value);
			track(() => widgetId.value);
			track(() => state.value.ready);

			if (!props.controller) return;

			props.controller.value = await buildHandle$();
		});

		useTask$(({ track }) => {
			track(() => state.value.ready);
			if (!state.value.ready) {
				hasEmittedReady.value = false;
			}
		});

		const elementId = useComputed$(() =>
			widgetId.value != null ? `better-captcha-${widgetId.value}` : "better-captcha-loading",
		);

		return (
			<div
				id={elementId.value}
				ref={(el: HTMLDivElement | null) => {
					hostEl.value = el;
				}}
				class={props.class}
				style={props.style}
				aria-live="polite"
				aria-busy={state.value.loading}
			/>
		);
	});
}
