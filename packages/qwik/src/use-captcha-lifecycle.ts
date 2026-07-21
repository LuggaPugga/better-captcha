import type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import type { NoSerialize, QRL } from "@builder.io/qwik";
import { noSerialize, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { CaptchaProps } from "./index";

export function useCaptchaLifecycle<
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
	providerFactory$: QRL<(identifier: string, scriptOptions?: ScriptOptions) => TProvider | Promise<TProvider>>,
	props: CaptchaProps<TOptions, THandle, TSolve> & { provider?: unknown },
) {
	const hostEl = useSignal<HTMLDivElement>();
	const widgetId = useSignal<WidgetId | null>(null);
	const state = useSignal<CaptchaState>({ loading: false, error: null, ready: false });
	const controllerRef = useSignal<
		NoSerialize<CaptchaController<TOptions, TResponse, TSolve, THandle>>
	>();

	const identifier = useComputed$(() => props.sitekey || props.endpoint || "");
	const shouldAutoRender = useComputed$(() => props.autoRender ?? true);
	const isLoading = useComputed$(() =>
		shouldAutoRender.value ? state.value.loading || !state.value.ready : state.value.loading,
	);
	const elementId = useComputed$(() =>
		widgetId.value != null ? `better-captcha-${widgetId.value}` : "better-captcha-loading",
	);

	useVisibleTask$(async ({ track, cleanup }) => {
		track(hostEl);
		track(identifier);
		track(() => props.scriptOptions);
		track(() => props.options);
		track(shouldAutoRender);
		track(() => props.provider);

		let cancelled = false;
		cleanup(() => {
			cancelled = true;
			controllerRef.value?.cleanup();
			controllerRef.value = undefined;
			if (props.controller) props.controller.value = null;
		});

		const element = hostEl.value;
		const id = identifier.value;
		if (!element || !id) return;

		try {
			const provider = await providerFactory$(id, props.scriptOptions);
			if (cancelled) return;

			const controller = new CaptchaController<TOptions, TResponse, TSolve, THandle>(
				() => provider,
			);
			controllerRef.value = noSerialize(controller);
			controller.onStateChange((newState) => {
				state.value = newState;
				widgetId.value = controller.getWidgetId();
				if (props.controller) props.controller.value = noSerialize(controller.getHandle());
			});
			controller.attachHost(element);
			controller.setIdentifier(id);
			controller.setScriptOptions(props.scriptOptions);
			controller.setOptions(props.options);
			controller.setCallbacks({
				onReady: () => {
					const handle = noSerialize(controller.getHandle());
					if (props.controller) props.controller.value = handle;
					void props.onReady$?.(handle);
				},
				onSolve: (token) => void props.onSolve$?.(token),
				onError: (error) =>
					void props.onError$?.(error instanceof Error ? error : new Error(String(error))),
			});

			if (shouldAutoRender.value) await controller.render();
		} catch (error) {
			if (!cancelled) {
				void props.onError$?.(error instanceof Error ? error : new Error(String(error)));
			}
		}
	});

	return { hostEl, elementId, isLoading };
}
