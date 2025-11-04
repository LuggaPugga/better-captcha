import type {
	CaptchaCallbacks,
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import type { NoSerialize, QRL } from "@builder.io/qwik";
import { $, component$, noSerialize, useComputed$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import type { CaptchaProps } from "./index";

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(providerFactory$: QRL<(identifier: string, scriptOptions?: ScriptOptions) => TProvider>) {
	return component$<CaptchaProps<TOptions, THandle>>((props) => {
		const hostEl = useSignal<HTMLDivElement | null>(null);
		const widgetId = useSignal<WidgetId | null>(null);
		const state = useSignal<CaptchaState>({ loading: true, error: null, ready: false });
		const hasEmittedReady = useSignal(false);
		const hasEmittedError = useSignal(false);
		const lastRenderKey = useSignal<string>("");

		const identifier = useComputed$(() => (props as any).sitekey || (props as any).endpoint);

		const controller = useSignal<NoSerialize<CaptchaController<TOptions, THandle, TProvider>> | null>(null);

		const cleanup$ = $(async () => {
			const ctrl = controller.value;
			if (ctrl) {
				ctrl.cleanup();
			}
		});

		const renderCaptcha$ = $(async () => {
			const el = hostEl.value;
			if (!el) return;

			const currentValue = identifier.value;
			if (!currentValue) return;

			const oldCtrl = controller.value;
			if (oldCtrl) {
				oldCtrl.cleanup();
			}

			const provider = await providerFactory$(currentValue, props.scriptOptions);

			const factory = () => provider;
			const ctrl = new CaptchaController<TOptions, THandle, TProvider>(factory);
			controller.value = noSerialize(ctrl);

			ctrl.onStateChange((newState: CaptchaState) => {
				state.value = newState;
				widgetId.value = ctrl.getWidgetId();
			});

			ctrl.attachHost(el);
			ctrl.setIdentifier(currentValue);
			ctrl.setScriptOptions(props.scriptOptions);
			ctrl.setOptions(props.options);

			const callbacks: CaptchaCallbacks = {
				onReady: async () => {
					if (!props.onReady$ || hasEmittedReady.value) return;
					const success = ctrl.getState().ready;
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
			ctrl.setCallbacks(callbacks);

			hasEmittedReady.value = false;
			hasEmittedError.value = false;

			await ctrl.render();
			widgetId.value = ctrl.getWidgetId();

			if (ctrl.getState().ready && props.onReady$ && !hasEmittedReady.value) {
				try {
					hasEmittedReady.value = true;
					await props.onReady$(await buildHandle$());
				} catch (err) {
					const error = err instanceof Error ? err : new Error(String(err));
					if (props.onError$ && !hasEmittedError.value) {
						hasEmittedError.value = true;
						await props.onError$(error);
					}
				}
			}
		});

		const buildHandle$ = $((): NoSerialize<THandle> => {
			const ctrl = controller.value;
			if (!ctrl) {
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

			const handle = ctrl.getHandle();
			return noSerialize({
				...handle,
				destroy: async () => {
					handle.destroy();
					state.value = { loading: false, error: null, ready: false };
				},
				render: async () => {
					await renderCaptcha$();
				},
				getComponentState: () => state.value,
			} as THandle);
		});

		const updateController$ = $(async () => {
			const ctrl = controller.value;
			if (ctrl && hostEl.value) {
				ctrl.attachHost(hostEl.value);
			}
		});

		useVisibleTask$(async ({ track, cleanup }) => {
			track(() => hostEl.value);
			track(() => identifier.value);
			track(() => props.scriptOptions);

			if (!hostEl.value) return;
			if (!identifier.value) return;

			await updateController$();

			if (props.autoRender ?? true) {
				const renderKey = `${identifier.value}::${JSON.stringify(props.scriptOptions ?? null)}`;
				if (lastRenderKey.value !== renderKey) {
					lastRenderKey.value = renderKey;
					await renderCaptcha$();
				}
			}

			cleanup(async () => {
				await cleanup$();
			});
		});

		useTask$(({ track }) => {
			track(() => props.options);
			const ctrl = controller.value;
			if (ctrl && state.value.ready) {
				ctrl.setOptions(props.options);
				void ctrl.render();
			}
		});

		useTask$(async ({ track }) => {
			track(() => controller.value);
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
