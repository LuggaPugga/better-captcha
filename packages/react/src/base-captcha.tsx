"use client";

import type { CaptchaHandle, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import type { CaptchaProps } from "./index";
import { useCaptchaLifecycle } from "./use-captcha-lifecycle";

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
