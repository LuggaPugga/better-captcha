import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";
import {
	type Component,
	defineComponent,
	h,
	onBeforeUnmount,
	onMounted,
	type PropType,
	ref,
	type StyleValue,
	watch,
} from "vue";

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(ProviderClass: new (sitekey: string) => TProvider): Component {
	return defineComponent({
		name: "BetterCaptcha",

		props: {
			sitekey: {
				type: String,
				required: true,
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
		},

		emits: {
			ready: (_handle: THandle) => true,
			error: (_error: Error) => true,
		},

		setup(props, { emit, expose }) {
			const elementRef = ref<HTMLDivElement>();
			const state = ref<CaptchaState>({ loading: true, error: null, ready: false });
			const widgetId = ref<WidgetId | null>(null);
			const buildFallbackHandle = (): THandle & CaptchaHandle =>
				({
					execute: async () => {},
					reset: () => {},
					destroy: () => {},
					getResponse: () => "",
					getComponentState: () => state.value,
				}) as THandle & CaptchaHandle;
			const handle = ref<THandle & CaptchaHandle>(buildFallbackHandle());

			let container: HTMLDivElement | null = null;
			let provider: TProvider | null = null;
			let renderToken = 0;

			const cleanup = (cancelRender = false): void => {
				if (cancelRender) {
					renderToken += 1;
				}

				if (provider && widgetId.value != null) {
					try {
						provider.destroy(widgetId.value);
					} catch (error) {
						console.warn("[better-captcha] cleanup:", error);
					}
				}

				container?.remove();
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
				} as THandle & CaptchaHandle;
			};

			const renderCaptcha = async (): Promise<void> => {
				const host = elementRef.value;
				if (!host) return;

				cleanup();

				const token = ++renderToken;
				const activeProvider = new ProviderClass(props.sitekey);

				state.value = { loading: true, error: null, ready: false };

				let mountTarget: HTMLDivElement | null = null;

				try {
					await activeProvider.init();
					if (token !== renderToken) return;

					mountTarget = document.createElement("div");
					host.appendChild(mountTarget);

					const id =
						props.options !== undefined
							? await activeProvider.render(mountTarget, props.options as TOptions)
							: await activeProvider.render(mountTarget);
					if (token !== renderToken) {
						mountTarget.remove();
						return;
					}

					provider = activeProvider;
					container = mountTarget;
					widgetId.value = id ?? null;
					handle.value = buildActiveHandle();
					state.value = { loading: false, error: null, ready: true };
					emit("ready", handle.value);
				} catch (error) {
					mountTarget?.remove();
					if (token !== renderToken) return;

					const err = error instanceof Error ? error : new Error(String(error));
					console.error("[better-captcha] render:", err);
					handle.value = buildFallbackHandle();
					state.value = { loading: false, error: err, ready: false };
					emit("error", err);
				}
			};

			expose({
				execute: () => handle.value.execute(),
				reset: () => handle.value.reset(),
				destroy: () => handle.value.destroy(),
				getResponse: () => handle.value.getResponse(),
				getComponentState: () => state.value,
			});

			onMounted(() => {
				void renderCaptcha();
			});

			watch(
				[() => props.sitekey, () => props.options],
				() => {
					void renderCaptcha();
				},
				{ deep: true },
			);

			onBeforeUnmount(() => {
				cleanup(true);
			});

			return () => {
				const elementId =
					widgetId.value !== null && widgetId.value !== undefined
						? `better-captcha-${widgetId.value}`
						: "better-captcha-loading";

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
	});
}
