import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";
import type { NoSerialize, QRL, Signal } from "@builder.io/qwik";
import { $, component$, noSerialize, useComputed$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";

export type CaptchaProps<TOptions, THandle extends CaptchaHandle> = {
	sitekey: string;
	options?: TOptions;
	class?: string;
	style?: string | Record<string, string | number>;
	controller?: Signal<NoSerialize<THandle> | null>;
	onReady?: QRL<(handle: NoSerialize<THandle>) => unknown>;
	onError?: QRL<(error: Error) => unknown>;
};

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(providerFactory$: QRL<(sitekey: string) => TProvider>) {
	return component$<CaptchaProps<TOptions, THandle>>((props) => {
		const hostEl = useSignal<HTMLDivElement | null>(null);
		const provider = useSignal<TProvider | null>(null);
		const widgetId = useSignal<WidgetId | null>(null);
		const containerEl = useSignal<HTMLDivElement | null>(null);
		const state = useSignal<CaptchaState>({ loading: true, error: null, ready: false });

		const optionsKey = useSignal("__init__");

		const computeOptionsKey$ = $(() => {
			try {
				return JSON.stringify(props.options ?? null);
			} catch {
				return "__non_serializable__";
			}
		});

		const buildHandle$ = $((): NoSerialize<THandle> | null => {
			const p = provider.value;
			const id = widgetId.value;
			if (!p || id == null) return null;
			const base = p.getHandle(id) as THandle;
			const enhanced = {
				...base,
				destroy: () => {
					if (widgetId.value != null) {
						try {
							base.destroy();
						} catch {
							/* ignore */
						}
						containerEl.value?.remove();
						containerEl.value = null;
						widgetId.value = null;
						state.value = { loading: true, error: null, ready: false };
					}
				},
				getComponentState: () => state.value,
			} as THandle;
			return noSerialize(enhanced);
		});

		const tearDown$ = $(() => {
			const p = provider.value;
			const id = widgetId.value;
			if (p && id != null) {
				p.destroy(id);
			}
			widgetId.value = null;
			containerEl.value?.remove();
			containerEl.value = null;
			provider.value = null;
		});

		useTask$(async ({ track }) => {
			track(() => props.options);
			optionsKey.value = await computeOptionsKey$();
		});

		// eslint-disable-next-line qwik/no-use-visible-task
		useVisibleTask$(async ({ track, cleanup }) => {
			const el = track(() => hostEl.value);
			const sitekey = track(() => props.sitekey);
			track(() => optionsKey.value);

			if (!el || !sitekey) return;

			let cancelled = false;

			await tearDown$();
			state.value = { loading: true, error: null, ready: false };
			if (!el.style.minHeight) el.style.minHeight = "40px";

			let localProvider: TProvider | null = null;
			try {
				localProvider = await providerFactory$(props.sitekey);
				provider.value = localProvider;
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err));
				state.value = { loading: false, error: e, ready: false };
				if (props.onError) await props.onError(e);
				return;
			}

			try {
				await localProvider.init();
				if (cancelled) return;

				const container = document.createElement("div");
				containerEl.value = container;
				el.appendChild(container);

				const id = await localProvider.render(container, props.options);
				if (cancelled) {
					if (id != null) {
						try {
							localProvider.destroy(id);
						} catch {
							/* ignore */
						}
					}
					container.remove();
					if (containerEl.value === container) containerEl.value = null;
					return;
				}

				widgetId.value = id ?? null;
				if (widgetId.value == null) {
					const e = new Error("Captcha render returned null widget id");
					state.value = { loading: false, error: e, ready: false };
					if (props.onError) await props.onError(e);
					return;
				}

				state.value = { loading: false, error: null, ready: true };
				if (props.onReady) {
					const handle = await buildHandle$();
					if (handle) await props.onReady(handle);
				}
			} catch (err) {
				if (cancelled) return;
				const e = err instanceof Error ? err : new Error(String(err));
				state.value = { loading: false, error: e, ready: false };
				if (props.onError) await props.onError(e);
			}

			cleanup(() => {
				cancelled = true;
				void tearDown$();
			});
		});

		useTask$(async ({ track }) => {
			track(() => provider.value);
			track(() => widgetId.value);
			track(() => state.value.ready);
			if (!props.controller) return;
			if (provider.value && widgetId.value != null && state.value.ready) {
				props.controller.value = (await buildHandle$()) ?? null;
			} else {
				props.controller.value = null;
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
				data-options-key={optionsKey.value}
			/>
		);
	});
}
