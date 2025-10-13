"use client";

import { forwardRef, useImperativeHandle, useMemo } from "react";
import { useCaptchaLifecycle } from "./hooks/use-captcha-lifecycle";
import type { CaptchaHandle, CaptchaProps, Provider, ProviderConfig } from "./provider";

const defaultHandle: CaptchaHandle = {
	execute: async () => {},
	reset: () => {},
	destroy: () => {},
	getResponse: () => "",
	getComponentState: () => ({
		loading: false,
		error: null,
		ready: false,
	}),
};

export function createCaptchaComponent<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (sitekey: string) => Provider<ProviderConfig, TOptions, THandle>,
) {
	return forwardRef<THandle, CaptchaProps<TOptions>>(function CaptchaComponent(
		{ sitekey, options, className, style },
		ref,
	) {
		const provider = useMemo(() => new ProviderClass(sitekey), [ProviderClass, sitekey]);
		const { elementRef, state, widgetIdRef, setState } = useCaptchaLifecycle(provider, options);

		useImperativeHandle(ref, () => {
			const id = widgetIdRef.current;
			const handle = id != null ? provider.getHandle(id) : (defaultHandle as THandle);

			return {
				...handle,
				getComponentState: () => state,
				destroy: () => {
					if (id != null) {
						handle.destroy();
						widgetIdRef.current = null;
						setState((prev) => ({ ...prev, ready: false, error: null }));
					}
				},
			};
		}, [provider, state, widgetIdRef, setState]);

		const widgetId = widgetIdRef.current;
		const elementId =
			widgetId !== null && widgetId !== undefined ? `react-captcha-${widgetId}` : "react-captcha-loading";

		return (
			<div
				id={elementId}
				ref={elementRef}
				className={className}
				style={style}
				aria-live="polite"
				aria-busy={state.loading}
			/>
		);
	});
}
