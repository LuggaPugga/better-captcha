"use client";

import { forwardRef, useImperativeHandle, useMemo } from "react";
import { useCaptchaLifecycle } from "./hooks/use-captcha-lifecycle";
import type {
	CaptchaHandle,
	CaptchaProps,
	Provider,
	ProviderConfig,
} from "./provider";

const defaultHandle: CaptchaHandle = {
	execute: async () => {},
	reset: () => {},
	destroy: () => {},
	getResponse: () => "",
};

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
>(
	ProviderClass: new (
		sitekey: string,
	) => Provider<ProviderConfig, TOptions, THandle>,
) {
	return forwardRef<THandle, CaptchaProps<TOptions>>(function CaptchaComponent(
		{ sitekey, options, className, style },
		ref,
	) {
		const provider = useMemo(
			() => new ProviderClass(sitekey),
			[ProviderClass, sitekey],
		);
		const { elementRef, state, widgetIdRef, setState } = useCaptchaLifecycle(
			provider,
			options,
		);

		useImperativeHandle(ref, () => {
			const id = widgetIdRef.current;
			const handle = id ? provider.getHandle(id) : (defaultHandle as THandle);

			return {
				...handle,
				getState: () => state,
				destroy: () => {
					if (id) {
						handle.destroy();
						widgetIdRef.current = null;
						setState((prev) => ({ ...prev, ready: false, error: null }));
					}
				},
			};
		}, [provider, state, widgetIdRef, setState]);

		return (
			<div
				id={
					widgetIdRef.current
						? `react-captcha-${widgetIdRef.current}`
						: "react-captcha-loading"
				}
				ref={elementRef}
				className={className}
				style={style}
				aria-live="polite"
				aria-busy={state.loading}
			/>
		);
	});
}
