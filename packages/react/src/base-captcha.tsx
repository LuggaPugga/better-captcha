"use client";

import type { CaptchaHandle, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import type { CaptchaProps } from "./index";
import { useCaptchaLifecycle } from "./use-captcha-lifecycle";

export type CaptchaProviderClass<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
> = new (
	identifier: string,
	scriptOptions?: ScriptOptions,
) => Provider<ProviderConfig, TOptions, THandle, TResponse, TSolve>;

export type BaseCaptchaProps<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
> = CaptchaProps<TOptions, TSolve, THandle> & {
	ProviderClass: CaptchaProviderClass<TOptions, TResponse, TSolve, THandle>;
};

type RuntimeCaptchaHandle = CaptchaHandle<unknown>;
type RuntimeBaseCaptchaProps = BaseCaptchaProps<unknown, unknown, unknown, RuntimeCaptchaHandle>;

export const BaseCaptcha = forwardRef<RuntimeCaptchaHandle, RuntimeBaseCaptchaProps>(function BaseCaptcha(props, ref) {
	const {
		ProviderClass,
		options,
		scriptOptions,
		className,
		style,
		autoRender = true,
		onReady,
		onSolve,
		onError,
	} = props;
	const identifier = props.sitekey || props.endpoint;
	if (!identifier) {
		throw new Error("Either 'sitekey' or 'endpoint' prop must be provided");
	}

	const callbacks = useMemo(() => ({ onReady, onSolve, onError }), [onReady, onSolve, onError]);
	const { elementRef, widgetId, isLoading, controller } = useCaptchaLifecycle(
		ProviderClass,
		identifier,
		scriptOptions,
		options,
		autoRender,
		callbacks,
	);

	useImperativeHandle(ref, () => controller.getHandle());

	const elementId = widgetId != null ? `better-captcha-${widgetId}` : "better-captcha-loading";

	return (
		<div id={elementId} ref={elementRef} className={className} style={style} aria-live="polite" aria-busy={isLoading} />
	);
}) as <
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
>(
	props: BaseCaptchaProps<TOptions, TResponse, TSolve, THandle> & React.RefAttributes<THandle>,
) => React.ReactElement | null;
