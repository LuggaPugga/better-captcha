"use client";

import type { CaptchaHandle, CaptchaResponse, ProviderName, RuntimeProviderClass } from "@better-captcha/core";
import { loadProviderClass } from "@better-captcha/core";
import { forwardRef, useEffect, useRef, useState } from "react";
import { BaseCaptcha } from "./base-captcha";
import type { CaptchaProps } from "./index";

type BetterCaptchaProps = CaptchaProps<Record<string, unknown>> & {
	provider: ProviderName | RuntimeProviderClass;
};

export const BetterCaptcha = forwardRef<CaptchaHandle<CaptchaResponse>, BetterCaptchaProps>(function BetterCaptcha(
	{ provider, ...props },
	ref,
) {
	const [ProviderClass, setProviderClass] = useState<RuntimeProviderClass | null>(null);
	const onErrorRef = useRef(props.onError);

	useEffect(() => {
		onErrorRef.current = props.onError;
	}, [props.onError]);

	useEffect(() => {
		if (typeof provider !== "string") {
			setProviderClass(null);
			return;
		}

		let cancelled = false;
		setProviderClass(null);

		void loadProviderClass(provider).then(
			(loadedProviderClass) => {
				if (!cancelled) setProviderClass(loadedProviderClass);
			},
			(error: unknown) => {
				if (cancelled) return;
				const err = error instanceof Error ? error : new Error(String(error));
				onErrorRef.current?.(err);
			},
		);

		return () => {
			cancelled = true;
		};
	}, [provider]);

	if (typeof provider !== "string") {
		return <BaseCaptcha ref={ref} ProviderClass={provider} {...props} />;
	}

	if (!ProviderClass) {
		return (
			<div id="better-captcha-loading" className={props.className} style={props.style} aria-live="polite" aria-busy />
		);
	}

	return <BaseCaptcha ref={ref} ProviderClass={ProviderClass} {...props} />;
});
