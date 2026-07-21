import type {
	CaptchaHandle,
	CaptchaResponse,
	CaptchaState,
	Provider,
	ProviderConfig,
	ProviderName,
	RuntimeProviderClass,
	ScriptOptions,
} from "@better-captcha/core";
import { loadProviderClass } from "@better-captcha/core";
import {
	defineComponent,
	h,
	markRaw,
	type Component,
	type PropType,
	ref,
	shallowRef,
	type StyleValue,
	watch,
} from "vue";
import { createCaptchaComponent } from "./create-captcha-component";

type DynamicHandle = CaptchaHandle<CaptchaResponse>;
type DynamicProvider = Provider<
	Record<string, unknown>,
	DynamicHandle,
	CaptchaResponse,
	CaptchaResponse
>;

export const BetterCaptcha = defineComponent({
	name: "BetterCaptcha",
	props: {
		provider: {
			type: [String, Function] as PropType<ProviderName | RuntimeProviderClass>,
			required: true,
		},
		sitekey: { type: String, default: undefined },
		endpoint: { type: String, default: undefined },
		options: { type: Object as PropType<Record<string, unknown>>, default: undefined },
		scriptOptions: { type: Object as PropType<ScriptOptions>, default: undefined },
		class: { type: String, default: undefined },
		style: { type: [String, Object, Array] as PropType<StyleValue>, default: undefined },
		autoRender: { type: Boolean, default: true },
	},
	emits: {
		ready: (_handle: DynamicHandle) => true,
		error: (_error: Error) => true,
		solve: (_token: CaptchaResponse) => true,
	},
	setup(props, { emit, expose }) {
		const captchaRef = ref<DynamicHandle | null>(null);
		const component = shallowRef<Component | null>(null);
		let loadToken = 0;

		watch(
			() => props.provider,
			async (provider) => {
				const token = ++loadToken;
				component.value = null;

				try {
					const ProviderClass = typeof provider === "string" ? await loadProviderClass(provider) : provider;
					if (token !== loadToken) return;
					component.value = markRaw(
						createCaptchaComponent<
							Record<string, unknown>,
							CaptchaResponse,
							CaptchaResponse,
							DynamicHandle,
							DynamicProvider
						>(ProviderClass as unknown as new (identifier: string, scriptOptions?: ScriptOptions) => DynamicProvider),
					);
				} catch (error) {
					if (token !== loadToken) return;
					emit("error", error instanceof Error ? error : new Error(String(error)));
				}
			},
			{ immediate: true },
		);

		expose({
			execute: () => captchaRef.value?.execute() ?? Promise.resolve(),
			reset: () => captchaRef.value?.reset(),
			destroy: () => captchaRef.value?.destroy(),
			render: () => captchaRef.value?.render() ?? Promise.resolve(),
			getResponse: () => captchaRef.value?.getResponse(),
			getComponentState: (): CaptchaState =>
				captchaRef.value?.getComponentState() ?? { loading: false, error: null, ready: false },
		});

		return () => {
			if (!component.value) {
				return h("div", {
					id: "better-captcha-loading",
					class: props.class,
					style: props.style,
					"aria-live": "polite",
					"aria-busy": true,
				});
			}

			return h(component.value, {
				ref: captchaRef,
				sitekey: props.sitekey,
				endpoint: props.endpoint,
				options: props.options,
				scriptOptions: props.scriptOptions,
				class: props.class,
				style: props.style,
				autoRender: props.autoRender,
				onReady: (handle: DynamicHandle) => emit("ready", handle),
				onError: (error: Error) => emit("error", error),
				onSolve: (token: CaptchaResponse) => emit("solve", token),
			});
		};
	},
});
