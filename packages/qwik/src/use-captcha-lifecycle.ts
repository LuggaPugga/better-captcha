import type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import type { NoSerialize, QRL, Signal } from "@builder.io/qwik";
import { noSerialize, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export function useCaptchaLifecycle<
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
	ProviderClass: new (identifier: string, scriptOptions?: ScriptOptions) => TProvider,
	sitekey: string | undefined,
	endpoint: string | undefined,
	scriptOptions: ScriptOptions | undefined,
	options: TOptions | undefined,
	autoRender: boolean | undefined,
	callbacks: {
		onReady$?: QRL<(handle: NoSerialize<THandle>) => unknown>;
		onError$?: QRL<(error: Error) => unknown>;
		onSolve$?: QRL<(token: TSolve) => void>;
	},
	controllerSignal?: Signal<NoSerialize<THandle> | null>,
) {
	const hostEl = useSignal<HTMLDivElement>();
	const widgetId = useSignal<WidgetId | null>(null);
	const state = useSignal<CaptchaState>({ loading: false, error: null, ready: false });
	const controllerRef = useSignal<
		NoSerialize<CaptchaController<TOptions, TResponse, TSolve, THandle, TProvider>> | null
	>(null);

	const identifier = useComputed$(() => sitekey || endpoint || "");
	const shouldAutoRender = useComputed$(() => autoRender ?? true);
	const isLoading = useComputed$(() =>
		shouldAutoRender.value ? state.value.loading || !state.value.ready : state.value.loading,
	);
	const elementId = useComputed$(() =>
		widgetId.value != null ? `better-captcha-${widgetId.value}` : "better-captcha-loading",
	);

	useVisibleTask$(({ cleanup }) => {
		cleanup(() => {
			controllerRef.value?.cleanup();
			controllerRef.value = null;
			if (controllerSignal) {
				controllerSignal.value = null;
			}
		});
	});

	useVisibleTask$(({ track }) => {
		track(hostEl);
		track(identifier);
		track(() => scriptOptions);
		track(() => options);
		track(shouldAutoRender);

		const el = hostEl.value;
		const id = identifier.value;
		if (!el || !id) return;

		if (!controllerRef.value) {
			const newCtrl = new CaptchaController<TOptions, TResponse, TSolve, THandle, TProvider>(
				(identifierValue, script) => new ProviderClass(identifierValue, script),
			);
			controllerRef.value = noSerialize(newCtrl);
			newCtrl.onStateChange((newState) => {
				state.value = newState;
				widgetId.value = newCtrl.getWidgetId();
				if (controllerSignal) {
					controllerSignal.value = noSerialize(newCtrl.getHandle()) as NoSerialize<THandle>;
				}
			});
		}

		const activeCtrl = controllerRef.value;
		if (!activeCtrl) return;

		activeCtrl.attachHost(el);
		activeCtrl.setIdentifier(id);
		activeCtrl.setScriptOptions(scriptOptions);
		activeCtrl.setOptions(options);
		activeCtrl.setCallbacks({
			onReady: () => {
				const handle = noSerialize(activeCtrl.getHandle()) as NoSerialize<THandle>;
				if (controllerSignal) {
					controllerSignal.value = handle;
				}
				void callbacks.onReady$?.(handle);
			},
			onSolve: (token: TSolve) => {
				void callbacks.onSolve$?.(token);
			},
			onError: (err: Error | string) => {
				const error = err instanceof Error ? err : new Error(String(err));
				void callbacks.onError$?.(error);
			},
		});

		if (shouldAutoRender.value) {
			void activeCtrl.render();
		}
	});

	return { hostEl, elementId, isLoading };
}
