"use client";

import type { CaptchaHandle, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";
import type { Ref } from "preact";
import { useImperativeHandle, useMemo } from "preact/hooks";
import type { CaptchaProps } from "./index";
import { useCaptchaLifecycle } from "./use-captcha-lifecycle";

export function createCaptchaComponent<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	ProviderClass: new (identifier: string, scriptOptions?: ScriptOptions) => Provider<ProviderConfig, TOptions, THandle>,
) {
	return function CaptchaComponent(props: CaptchaProps<TOptions> & { ref?: Ref<THandle> }) {
		const { options, scriptOptions, className, style, autoRender = true, onReady, onSolve, onError, ref } = props;

		const p = props as CaptchaProps<TOptions> & {
			sitekey?: string;
			endpoint?: string;
		};
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

		useImperativeHandle(ref as Ref<THandle>, () => controller.getHandle());

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
	};
}
