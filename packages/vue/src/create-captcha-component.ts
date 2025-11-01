import type { CaptchaCallbacks, CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";
import { cleanup as cleanupWidget } from "@better-captcha/core/utils/lifecycle";
import {
	type Component,
	computed,
	defineComponent,
	h,
	onBeforeUnmount,
	onMounted,
	type PropType,
	ref,
	type StyleValue,
	watch,
} from "vue";
import { CaptchaEmits, CaptchaProps } from ".";

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(ProviderClass: new (identifier: string) => TProvider, identifierProp: "sitekey" | "endpoint" = "sitekey"): Component<CaptchaProps<TOptions>, CaptchaEmits<THandle>> {
	return defineComponent({
		name: "BetterCaptcha",
		props: {
			sitekey: {
				type: String,
				default: undefined,
			},
			endpoint: {
				type: String,
				default: undefined,
			},
			options: {
				type: Object as PropType<TOptions>,
				default: undefined,
			},
			class: {
				type: String,
				default: undefined,
			},
			style: {
				type: [String, Object, Array] as PropType<StyleValue>,
				default: undefined,
			},
			autoRender: {
				type: Boolean,
				default: true,
			},
		},
		emits: {
			ready: (_handle: THandle) => true,
			error: (_error: Error) => true,
			solve: (_token: string) => true,
		},
		setup(props, { emit, expose }) {
			const elementRef = ref<HTMLDivElement>();
			const state = ref<CaptchaState>({ loading: props.autoRender ?? true, error: null, ready: false });
			const widgetId = ref<WidgetId | null>(null);
			const buildFallbackHandle = (): THandle & CaptchaHandle =>
				({
					execute: async () => {},
					reset: () => {},
					destroy: () => {},
					render: () => renderCaptcha(),
					getResponse: () => "",
					getComponentState: () => state.value,
				}) as THandle & CaptchaHandle;
			const handle = ref<THandle & CaptchaHandle>(buildFallbackHandle());

			let container: HTMLDivElement | null = null;
			let provider: TProvider | null = null;
			let renderToken = 0;
			let isRendering = false;
			let hasRendered = false;
			let pendingRender = false;

			const getIdentifierValue = (): string | undefined => {
				return identifierProp === "endpoint" ? props.endpoint : props.sitekey;
			};

			const validateIdentifierProp = (): void => {
				const expectedValue = identifierProp === "endpoint" ? props.endpoint : props.sitekey;
				const unexpectedValue = identifierProp === "endpoint" ? props.sitekey : props.endpoint;
				
				if (unexpectedValue !== undefined && unexpectedValue !== null && unexpectedValue !== "") {
					const error = new Error(
						`Provider expects '${identifierProp}' prop, but '${identifierProp === "endpoint" ? "sitekey" : "endpoint"}' was provided instead`
					);
					state.value = { loading: false, error, ready: false };
					emit("error", error);
					return;
				}
				
				if (expectedValue === undefined || expectedValue === null || expectedValue === "") {
					const error = new Error(
						`Provider requires '${identifierProp}' prop, but it was not provided or is empty`
					);
					state.value = { loading: false, error, ready: false };
					emit("error", error);
					return;
				}
			};

			const identifier = computed(() => getIdentifierValue());

			const cleanup = (cancelRender = false): void => {
				if (cancelRender) {
					renderToken += 1;
				}

				cleanupWidget(provider, widgetId.value, container);

				container = null;
				provider = null;
				widgetId.value = null;
				handle.value = buildFallbackHandle();
			};

			const buildActiveHandle = (): THandle & CaptchaHandle => {
				if (!provider || widgetId.value == null) {
					return buildFallbackHandle();
				}

				const baseHandle = provider.getHandle(widgetId.value);
				return {
					...baseHandle,
					getComponentState: () => state.value,
					destroy: () => {
						baseHandle.destroy();
						cleanup(true);
					},
					render: () => renderCaptcha(),
				} as THandle & CaptchaHandle;
			};

			const renderCaptcha = async (): Promise<void> => {
				const host = elementRef.value;
				if (!host) return;

				const validatedIdentifier = getIdentifierValue();
				if (!validatedIdentifier) {
					return;
				}

				if (isRendering) {
					pendingRender = true;
					return;
				}

				isRendering = true;
				pendingRender = false;
				cleanup();

				const token = ++renderToken;
				const activeProvider = new ProviderClass(validatedIdentifier);

				state.value = { loading: true, error: null, ready: false };

				let mountTarget: HTMLDivElement | null = null;

				try {
					await activeProvider.init();
					if (token !== renderToken) {
						isRendering = false;
						return;
					}

					mountTarget = document.createElement("div");
					host.appendChild(mountTarget);

					const callbacks: CaptchaCallbacks = {
						onReady: () => {
							if (token === renderToken) {
								emit("ready", handle.value);
							}
						},
						onSolve: (solveToken: string) => {
							if (token === renderToken) {
								emit("solve", solveToken);
							}
						},
						onError: (err: Error | string) => {
							if (token === renderToken) {
								const error = err instanceof Error ? err : new Error(String(err));
								emit("error", error);
							}
						},
					};

					const id =
						props.options !== undefined
							? await activeProvider.render(mountTarget, props.options as TOptions, callbacks)
							: await activeProvider.render(mountTarget, undefined, callbacks);
					if (token !== renderToken) {
						mountTarget.remove();
						isRendering = false;
						return;
					}

					provider = activeProvider;
					container = mountTarget;
					widgetId.value = id ?? null;
					handle.value = buildActiveHandle();
					state.value = { loading: false, error: null, ready: true };
				} catch (error) {
					mountTarget?.remove();
					if (token !== renderToken) {
						isRendering = false;
						return;
					}

					const err = error instanceof Error ? error : new Error(String(error));
					console.error("[better-captcha] render:", err);
					handle.value = buildFallbackHandle();
					state.value = { loading: false, error: err, ready: false };
					emit("error", err);
				} finally {
					isRendering = false;
					if (pendingRender) {
						pendingRender = false;
						queueMicrotask(() => {
							void renderCaptcha();
						});
					}
				}
			};

			onMounted(() => {
				if (props.autoRender) {
					void renderCaptcha();
				}
			});

			watch(
				() => state.value.ready,
				(ready) => {
					if (ready) {
						hasRendered = true;
					}
				},
			);

			watch(
				[() => props.sitekey, () => props.endpoint],
				() => {
					validateIdentifierProp();
				},
				{ immediate: true },
			);

			watch(
				[identifier, () => props.options],
				() => {
					if (props.autoRender && hasRendered) {
						void renderCaptcha();
					}
				},
				{ deep: true },
			);

			onBeforeUnmount(() => {
				cleanup(true);
			});

			expose({
				execute: () => handle.value.execute(),
				reset: () => handle.value.reset(),
				destroy: () => handle.value.destroy(),
				render: () => renderCaptcha(),
				getResponse: () => handle.value.getResponse(),
				getComponentState: () => state.value,
			});

			return () => {
				const id = widgetId.value;
				const elementId = id !== null && id !== undefined ? `better-captcha-${id}` : "better-captcha-loading";

				return h("div", {
					id: elementId,
					ref: elementRef,
					class: props.class,
					style: props.style,
					"aria-live": "polite",
					"aria-busy": state.value.loading,
				});
			};
		},
	}) as Component<CaptchaProps<TOptions>, CaptchaEmits<THandle>>;
}
