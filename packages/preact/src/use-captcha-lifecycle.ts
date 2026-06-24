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
	const callbacksRef = useRef(callbacks);

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

	useEffect(() => {
		callbacksRef.current = callbacks;
	}, [callbacks]);

	const isLoading = autoRender ? state.loading || !state.ready : state.loading;

	useEffect(
		() =>
			controller.onStateChange((newState) => {
				setState(newState);
				setWidgetId(controller.getWidgetId());
			}),
		[controller],
	);

	useEffect(() => {
		controller.attachHost(elementRef.current);
		controller.setIdentifier(identifier);
		controller.setScriptOptions(scriptOptions);
		controller.setOptions(options);
		controller.setCallbacks({
			onReady: () => callbacksRef.current?.onReady?.(controller.getHandle()),
			onSolve: (token: TSolve) => callbacksRef.current?.onSolve?.(token),
			onError: (err: Error | string) => {
				callbacksRef.current?.onError?.(err instanceof Error ? err : new Error(String(err)));
			},
		});

		if (autoRender) {
			void controller.render();
		}
	}, [controller, identifier, scriptOptions, options, autoRender]);

	useEffect(() => () => controller.cleanup(), [controller]);

	const renderCaptcha = useCallback(async () => {
		await controller.render();
	}, [controller]);

	return { elementRef, state, widgetId, isLoading, renderCaptcha, controller };
}
