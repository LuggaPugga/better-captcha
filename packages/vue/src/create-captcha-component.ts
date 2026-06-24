import type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId
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
import { CaptchaEmits, CaptchaProps } from ".";

export function createCaptchaComponent<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
	TProvider extends Provider<
		ProviderConfig,
		TOptions,
		THandle,
		TResponse,
		TSolve
	> = Provider<ProviderConfig, TOptions, THandle, TResponse, TSolve>,
>(
	ProviderClass: new (
		identifier: string,
		scriptOptions?: ScriptOptions,
	) => TProvider,
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

			const identifier = computed(() =>
				identifierProp === "endpoint" ? props.endpoint : props.sitekey,
			);

			const isLoading = computed(() =>
				props.autoRender
					? state.value.loading || !state.value.ready
					: state.value.loading,
			);

			const controller = new CaptchaController<
				TOptions,
				TResponse,
				TSolve,
				THandle,
				TProvider
			>(
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
						onError: (err: any) => {
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
