import type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";

export function useCaptchaLifecycle<
	TOptions = unknown,
	TResponse = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
	TSolve = string,
>(
	ProviderClass: new (
		identifier: string,
		scriptOptions?: ScriptOptions,
	) => Provider<ProviderConfig, TOptions, THandle, TResponse, TSolve>,
	identifier: string,
	scriptOptions: ScriptOptions | undefined,
	options: TOptions | undefined,
	autoRender = true,
	callbacks?: {
		onReady?: (handle: THandle) => void;
		onSolve?: (token: TSolve) => void;
		onError?: (error: Error) => void;
	},
) {
	const elementRef = useRef<HTMLDivElement>(null);
	const hasRenderedRef = useRef(false);

	const controller = useMemo(
		() =>
			new CaptchaController<
				TOptions,
				TResponse,
				TSolve,
				THandle,
				Provider<ProviderConfig, TOptions, THandle, TResponse, TSolve>
			>((id, script) => new ProviderClass(id, script)),
		[ProviderClass],
	);

	const [state, setState] = useState<CaptchaState>({
		loading: false,
		error: null,
		ready: false,
	});

	const [widgetId, setWidgetId] = useState<WidgetId | null>(null);

	const callbacksRef = useRef(callbacks);

	useEffect(() => {
		callbacksRef.current = callbacks;
	}, [callbacks]);

	const isLoading = autoRender ? state.loading || !state.ready : state.loading;

	useEffect(() => {
		const unsubscribe = controller.onStateChange((newState) => {
			setState(newState);
			setWidgetId(controller.getWidgetId());
			if (newState.ready) hasRenderedRef.current = true;
		});
		return unsubscribe;
	}, [controller]);

	useEffect(() => {
		controller.attachHost(elementRef.current);
		controller.setIdentifier(identifier);
		controller.setScriptOptions(scriptOptions);
		controller.setOptions(options);
		controller.setCallbacks({
			onReady: () => callbacksRef.current?.onReady?.(controller.getHandle()),
			onSolve: (token: TSolve) => callbacksRef.current?.onSolve?.(token),
			onError: (err: Error | string) => {
				const error = err instanceof Error ? err : new Error(String(err));
				callbacksRef.current?.onError?.(error);
			},
		});
	}, [controller, identifier, scriptOptions, options]);

	const renderCaptcha = useCallback(async () => {
		await controller.render();
	}, [controller]);

	const renderKeyRef = useRef("");
	useEffect(() => {
		if (!autoRender) return;
		const key = `${identifier}::${JSON.stringify(options)}::${JSON.stringify(scriptOptions)}`;
		const shouldRender = !hasRenderedRef.current || state.error || renderKeyRef.current !== key;
		if (shouldRender) {
			renderKeyRef.current = key;
			void renderCaptcha();
		}
	}, [autoRender, identifier, options, scriptOptions, renderCaptcha, state.error]);

	useEffect(() => {
		return () => {
			controller.cleanup();
		};
	}, [controller]);

	return { elementRef, state, widgetId, isLoading, renderCaptcha, controller };
}
