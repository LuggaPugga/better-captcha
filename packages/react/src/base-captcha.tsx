"use client";

import type { CaptchaHandle, Provider, ProviderConfig } from "@better-captcha/core";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import type { CaptchaProps, CaptchaPropsWithEndpoint } from "./index";
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

type ValueProp = "sitekey" | "endpoint";

type PropsForValue<TOptions, TValue extends ValueProp> = TValue extends "sitekey"
	? CaptchaProps<TOptions>
	: CaptchaPropsWithEndpoint<TOptions>;

function createComponentInternal<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TValue extends ValueProp = "sitekey",
>(
	ProviderClass: new (sitekeyOrEndpoint: string) => Provider<ProviderConfig, TOptions, THandle>,
	valueProp: TValue,
	errorMessage: string,
) {
	return forwardRef<THandle, PropsForValue<TOptions, TValue>>(function CaptchaComponent(props, ref) {
		const { options, className, style, autoRender = true } = props;
		const value = props[valueProp];
		if (!value) {
			throw new Error(errorMessage);
		}

		const provider = useMemo(() => new ProviderClass(value as string), [ProviderClass, value]);
		const { elementRef, state, widgetIdRef, setState, renderCaptcha } = useCaptchaLifecycle(
			provider,
			options,
			autoRender,
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

export function createCaptchaComponent<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (sitekeyOrEndpoint: string) => Provider<ProviderConfig, TOptions, THandle>,
) {
	return createComponentInternal<TOptions, THandle, "sitekey">(
		ProviderClass,
		"sitekey",
		"'sitekey' prop must be provided",
	);
}

export function createCaptchaComponentWithEndpoint<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (sitekeyOrEndpoint: string) => Provider<ProviderConfig, TOptions, THandle>,
) {
	return createComponentInternal<TOptions, THandle, "endpoint">(
		ProviderClass,
		"endpoint",
		"'endpoint' prop must be provided",
	);
}
