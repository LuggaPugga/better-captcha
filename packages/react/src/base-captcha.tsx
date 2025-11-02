"use client";

import type { CaptchaHandle, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import type { CaptchaProps } from "./index";
import { useCaptchaLifecycle } from "./use-captcha-lifecycle";

const defaultHandle: CaptchaHandle = {
	execute: async () => {},
	reset: () => {},
	destroy: () => {},
	render: async () => {},
	getResponse: () => "",
	getComponentState: () => ({
		loading: false,
		error: null,
		ready: false,
	}),
};

export function createCaptchaComponent<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (identifier: string, scriptOptions?: ScriptOptions) => Provider<ProviderConfig, TOptions, THandle>,
) {
	return forwardRef<THandle, CaptchaProps<TOptions>>(function CaptchaComponent(props, ref) {
		const { options, scriptOptions, className, style, autoRender = true, onReady, onSolve, onError } = props;
		const p = props as CaptchaProps<TOptions> & { sitekey?: string; endpoint?: string };
		const identifier = p.sitekey || p.endpoint;
		if (!identifier) {
			throw new Error("Either 'sitekey' or 'endpoint' prop must be provided");
		}

		const provider = useMemo(
			() => new ProviderClass(identifier, scriptOptions),
			[ProviderClass, identifier, scriptOptions],
		);
		const callbacks = useMemo(() => ({ onReady, onSolve, onError }), [onReady, onSolve, onError]);
		const { elementRef, state, widgetIdRef, setState, renderCaptcha } = useCaptchaLifecycle(
			provider,
			options,
			autoRender,
			callbacks,
		);

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
				render: async () => {
					await renderCaptcha();
				},
			};
		}, [provider, state, widgetIdRef, setState, renderCaptcha]);

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
