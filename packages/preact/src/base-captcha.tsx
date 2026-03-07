"use client";

import type { CaptchaHandle, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";
import { forwardRef } from "preact/compat";
import { useImperativeHandle, useMemo } from "preact/hooks";
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
	return forwardRef<THandle, CaptchaProps<TOptions, TSolve>>(function CaptchaComponent(props, ref) {
		const { options, scriptOptions, className, style, autoRender = true, onReady, onSolve, onError } = props;
		const p = props as CaptchaProps<TOptions, TSolve> & { sitekey?: string; endpoint?: string };
		const identifier = p.sitekey || p.endpoint;

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

		const elementId =
			widgetId !== null && widgetId !== undefined ? `better-captcha-${widgetId}` : "better-captcha-loading";

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
