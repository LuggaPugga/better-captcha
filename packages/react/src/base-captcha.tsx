"use client";

import type { CaptchaHandle, Provider, ProviderConfig } from "@better-captcha/core";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import type { CaptchaProps } from "./index";
import { useCaptchaLifecycle } from "./use-captcha-lifecycle";

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
			widgetId !== null && widgetId !== undefined ? `better-captcha-${widgetId}` : "better-captcha-loading";

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
