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
	nextTick,
	onBeforeUnmount,
	onMounted,
	type PropType,
	ref,
	type StyleValue,
	watch,
	watchEffect,
} from "vue";
import { CaptchaEmits, CaptchaProps } from ".";

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<
		ProviderConfig,
		TOptions,
		THandle
	> = Provider<ProviderConfig, TOptions, THandle>,
>(
	ProviderClass: new (
		identifier: string,
		scriptOptions?: ScriptOptions,
	) => TProvider,
	identifierProp: "sitekey" | "endpoint" = "sitekey",
): Component<CaptchaProps<TOptions>, CaptchaEmits<THandle>> {
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
			let hasRendered = false;

			const identifier = computed(() =>
				identifierProp === "endpoint" ? props.endpoint : props.sitekey,
			);

			const isLoading = computed(() =>
				props.autoRender
					? state.value.loading || !state.value.ready
					: state.value.loading,
			);

			const controller = new CaptchaController<TOptions, THandle, TProvider>(
				(id, script) => new ProviderClass(id, script),
			);

			const unsubscribeState = controller.onStateChange((newState) => {
				state.value = newState;
				widgetId.value = controller.getWidgetId();
				if (newState.ready) hasRendered = true;
			});

			watchEffect(() => {
				controller.attachHost(elementRef.value ?? null);
				controller.setIdentifier(identifier.value);
				controller.setScriptOptions(props.scriptOptions);
				controller.setOptions(props.options as TOptions);

				controller.setCallbacks({
					onReady: () => emit("ready", controller.getHandle()),
					onSolve: (token: string) => emit("solve", token),
					onError: (err: any) => {
						const error = err instanceof Error ? err : new Error(String(err));
						emit("error", error);
					},
				});
			});

			const renderCaptcha = async () => {
				if (!elementRef.value || !identifier.value) return;
				await controller.render();
				widgetId.value = controller.getWidgetId();
			};

			watch(
				[identifier, () => props.options, () => props.scriptOptions],
				() => {
					if (props.autoRender && (hasRendered || state.value.error)) {
						void renderCaptcha();
					}
				},
				{ deep: true },
			);

			onMounted(() => {
				if (props.autoRender) {
					nextTick(() => void renderCaptcha());
				}
			});

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