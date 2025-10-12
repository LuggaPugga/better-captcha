"use client";

import { forwardRef, useImperativeHandle, useMemo } from "react";
import { useCaptchaLifecycle } from "./hooks/use-captcha-lifecycle";
import type {
	CaptchaHandle,
	CaptchaProps,
	CaptchaState,
	Provider,
	ProviderConfig,
} from "./provider";

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
			if (!id) {
				return {
					execute: async () => {},
					reset: () => {},
					destroy: () => {},
					getResponse: () => "",
					getState: () => state,
				} as THandle & { getState: () => CaptchaState };
			}
			const handle = provider.getHandle(id);
			return {
				...handle,
				getState: () => state,
				destroy() {
					handle.destroy();
					widgetIdRef.current = null;
					setState((prevState: CaptchaState) => ({
						...prevState,
						ready: false,
						error: null,
					}));
				},
			};
		}, [provider, state, setState, widgetIdRef]);

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
