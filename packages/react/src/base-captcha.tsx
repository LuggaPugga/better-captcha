"use client";

import type { CaptchaHandle, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import type { CaptchaProps } from "./index";
import { useCaptchaLifecycle } from "./use-captcha-lifecycle";

export function createCaptchaComponent<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
>(
	ProviderClass: new (
		identifier: string,
		scriptOptions?: ScriptOptions,
	) => Provider<ProviderConfig, TOptions, THandle, TResponse, TSolve>,
) {
	return forwardRef<THandle, CaptchaProps<TOptions, TSolve, THandle>>(function CaptchaComponent(props, ref) {
		const { options, scriptOptions, className, style, autoRender = true, onReady, onSolve, onError } = props;
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

		useImperativeHandle(ref, () => controller.getHandle(), [controller]);

		const elementId = widgetId != null ? `better-captcha-${widgetId}` : "better-captcha-loading";

		return (
			<div
				id={elementId}
				ref={elementRef}
				className={className}
				style={style}
				aria-live="polite"
				aria-busy={isLoading}
			/>
		);
	});
}
