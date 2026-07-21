import type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import {
	type Component,
	computed,
	defineComponent,
	h,
	onBeforeUnmount,
	type PropType,
	ref,
	type StyleValue,
	watch,
} from "vue";
import type { CaptchaEmits, CaptchaProps } from ".";

export function createCaptchaComponent<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
	TProvider extends Provider<TOptions, THandle, TResponse, TSolve> = Provider<
		TOptions,
		THandle,
		TResponse,
		TSolve
	>,
>(
	ProviderClass: new (identifier: string, scriptOptions?: ScriptOptions) => TProvider,
	identifierProp: "sitekey" | "endpoint" = "sitekey",
): Component<CaptchaProps<TOptions, TSolve>, CaptchaEmits<THandle, TSolve>> {
	return defineComponent({
		name: "BetterCaptcha",
		props: {
			sitekey: { type: String, default: undefined },
			endpoint: { type: String, default: undefined },
			options: { type: Object as PropType<TOptions>, default: undefined },
			scriptOptions: {
				type: Object as PropType<ScriptOptions>,
				default: undefined,
			},
			class: { type: String, default: undefined },
			style: {
				type: [String, Object, Array] as PropType<StyleValue>,
				default: undefined,
			},
			autoRender: { type: Boolean, default: true },
		},
		emits: ["ready", "error", "solve"],
		setup(props, { emit, expose }) {
			const elementRef = ref<HTMLDivElement>();
			const state = ref<CaptchaState>({
				loading: false,
				error: null,
				ready: false,
			});
			const widgetId = ref<WidgetId | null>(null);

			const identifier = computed(() => props[identifierProp] ?? props.sitekey ?? props.endpoint);

			const isLoading = computed(() => state.value.loading || (props.autoRender && !state.value.ready));

			const controller = new CaptchaController<TOptions, TResponse, TSolve, THandle>(
				(id, script) => new ProviderClass(id, script),
			);

			const unsubscribeState = controller.onStateChange((newState) => {
				state.value = newState;
				widgetId.value = controller.getWidgetId();
			});

			watch(
				[elementRef, identifier, () => props.options, () => props.scriptOptions, () => props.autoRender],
				() => {
					controller.attachHost(elementRef.value ?? null);
					controller.setIdentifier(identifier.value);
					controller.setScriptOptions(props.scriptOptions);
					controller.setOptions(props.options as TOptions);

					controller.setCallbacks({
						onReady: () => emit("ready", controller.getHandle()),
						onSolve: (token: TSolve) => emit("solve", token),
						onError: (err: Error | string) => {
							const error = err instanceof Error ? err : new Error(String(err));
							emit("error", error);
						},
					});

					if (props.autoRender) {
						void controller.render();
					}
				},
				{ deep: true, flush: "post" },
			);

			const renderCaptcha = async () => {
				await controller.render();
				widgetId.value = controller.getWidgetId();
			};

			onBeforeUnmount(() => {
				controller.cleanup();
				unsubscribeState();
			});

			expose({
				execute: () => controller.getHandle().execute(),
				reset: () => controller.getHandle().reset(),
				destroy: () => controller.cleanup(),
				render: renderCaptcha,
				getResponse: () => controller.getHandle().getResponse(),
				getComponentState: () => state.value,
			});

			return () =>
				h("div", {
					id:
						widgetId.value != null
							? `better-captcha-${widgetId.value}`
							: "better-captcha-loading",
					ref: elementRef,
					class: props.class,
					style: props.style,
					"aria-live": "polite",
					"aria-busy": isLoading.value,
				});
		},
	});
}
