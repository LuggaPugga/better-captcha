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
import {
	type Component,
	computed,
	defineComponent,
	h,
	nextTick,
	onBeforeUnmount,
	onMounted,
	onUnmounted,
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
>(
	ProviderClass: new (identifier: string, scriptOptions?: ScriptOptions) => TProvider,
	identifierProp: "sitekey" | "endpoint" = "sitekey",
): Component<CaptchaProps<TOptions>, CaptchaEmits<THandle>> {
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
			scriptOptions: {
				type: Object as PropType<ScriptOptions>,
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
			const state = ref<CaptchaState>({ loading: false, error: null, ready: false });
			const widgetId = ref<WidgetId | null>(null);
			let hasRendered = false;

			const getIdentifierValue = (): string | undefined => {
				return identifierProp === "endpoint" ? props.endpoint : props.sitekey;
			};

			const validateIdentifierProp = (): void => {
				const expectedValue = identifierProp === "endpoint" ? props.endpoint : props.sitekey;
				const unexpectedValue = identifierProp === "endpoint" ? props.sitekey : props.endpoint;

				if (unexpectedValue !== undefined && unexpectedValue !== null && unexpectedValue !== "") {
					const error = new Error(
						`Provider expects '${identifierProp}' prop, but '${identifierProp === "endpoint" ? "sitekey" : "endpoint"}' was provided instead`,
					);
					state.value = { loading: false, error, ready: false };
					emit("error", error);
					return;
				}

				if (expectedValue === undefined || expectedValue === null || expectedValue === "") {
					const error = new Error(
						`Provider requires '${identifierProp}' prop, but it was not provided or is empty`,
					);
					state.value = { loading: false, error, ready: false };
					emit("error", error);
					return;
				}
			};

			const identifier = computed(() => getIdentifierValue());

			const controller = new CaptchaController<TOptions, THandle, TProvider>(
				(id: string, script?: ScriptOptions) => new ProviderClass(id, script),
			);

			const unsubscribeState = controller.onStateChange((newState) => {
				state.value = newState;
				widgetId.value = controller.getWidgetId();
			});

			watch(
				elementRef,
				(el) => {
					controller.attachHost(el ?? null);
				},
				{ immediate: true },
			);

			watch(
				identifier,
				(id) => {
					controller.setIdentifier(id);
				},
				{ immediate: true },
			);

			watch(
				() => props.scriptOptions,
				(scriptOpts) => {
					controller.setScriptOptions(scriptOpts);
				},
				{ immediate: true },
			);

			watch(
				() => props.options,
				(opts) => {
					controller.setOptions(opts);
				},
				{ immediate: true, deep: true },
			);

			const callbacks = computed<CaptchaCallbacks>(() => ({
				onReady: () => {
					emit("ready", controller.getHandle());
				},
				onSolve: (token: string) => {
					emit("solve", token);
				},
				onError: (err: Error | string) => {
					const error = err instanceof Error ? err : new Error(String(err));
					emit("error", error);
				},
			}));

			watch(
				callbacks,
				(cbs) => {
					controller.setCallbacks(cbs);
				},
				{ immediate: true },
			);

			const renderCaptcha = async (): Promise<void> => {
				if (!elementRef.value || !identifier.value) return;
				await controller.render();
				widgetId.value = controller.getWidgetId();
			};

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
				[identifier, () => props.options, () => props.scriptOptions],
				() => {
					if (props.autoRender && hasRendered && elementRef.value && identifier.value) {
						void renderCaptcha();
					}
				},
				{ deep: true },
			);

			onMounted(async () => {
				if (props.autoRender) {
					await nextTick();
					if (elementRef.value && identifier.value) {
						void renderCaptcha();
					}
				}
			});

			onBeforeUnmount(() => {
				controller.cleanup();
			});

			onUnmounted(() => {
				unsubscribeState();
			});

			expose({
				execute: () => controller.getHandle().execute(),
				reset: () => controller.getHandle().reset(),
				destroy: () => controller.cleanup(),
				render: () => renderCaptcha(),
				getResponse: () => controller.getHandle().getResponse(),
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
