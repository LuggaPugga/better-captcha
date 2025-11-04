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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useCaptchaLifecycle<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (identifier: string, scriptOptions?: ScriptOptions) => Provider<ProviderConfig, TOptions, THandle>,
	identifier: string,
	scriptOptions: ScriptOptions | undefined,
	options: TOptions | undefined,
	autoRender = true,
	callbacks?: CaptchaCallbacks,
) {
	const elementRef = useRef<HTMLDivElement>(null);
	const lastKeyRef = useRef<string>("");

	const controller = useMemo(
		() =>
			new CaptchaController<TOptions, THandle, Provider<ProviderConfig, TOptions, THandle>>(
				(id: string, script?: ScriptOptions) => new ProviderClass(id, script),
			),
		[ProviderClass],
	);

	const [state, setState] = useState<CaptchaState>({
		loading: autoRender,
		error: null,
		ready: false,
	});

	const [widgetId, setWidgetId] = useState<WidgetId | null>(null);

	useEffect(() => {
		const unsubscribe = controller.onStateChange((newState) => {
			setState(newState);
			setWidgetId(controller.getWidgetId());
		});
		return unsubscribe;
	}, [controller]);

	useEffect(() => {
		controller.attachHost(elementRef.current);
	}, [controller]);

	useEffect(() => {
		controller.setIdentifier(identifier);
	}, [controller, identifier]);

	useEffect(() => {
		controller.setScriptOptions(scriptOptions);
	}, [controller, scriptOptions]);

	useEffect(() => {
		controller.setOptions(options);
	}, [controller, options]);

	useEffect(() => {
		controller.setCallbacks(callbacks);
	}, [controller, callbacks]);

	const renderCaptcha = useCallback(async () => {
		await controller.render();
	}, [controller]);

	useEffect(() => {
		if (!autoRender) return;

		const key = `${ProviderClass.name ?? "Provider"}::${identifier}::${JSON.stringify(options ?? null)}::${JSON.stringify(scriptOptions ?? null)}`;
		if (lastKeyRef.current !== key) {
			lastKeyRef.current = key;
			void renderCaptcha();
		}

		return () => {
			controller.cleanup();
		};
	}, [autoRender, ProviderClass, identifier, options, scriptOptions, controller, renderCaptcha]);

	const widgetIdRef = useRef<WidgetId | null>(null);
	widgetIdRef.current = widgetId;

	return { elementRef, state, widgetIdRef, widgetId, renderCaptcha, controller };
}
