"use client";

import type { CaptchaHandle, CaptchaResponse, ProviderName, RuntimeProviderClass } from "@better-captcha/core";
import { loadProviderClass } from "@better-captcha/core";
import { forwardRef, useEffect, useRef, useState } from "react";
import { BaseCaptcha } from "./base-captcha";
import type { CaptchaProps } from "./index";

export type BetterCaptchaProps = CaptchaProps<Record<string, unknown>, CaptchaResponse> & {
	provider: ProviderName | RuntimeProviderClass;
};

export const BetterCaptcha = forwardRef<CaptchaHandle<CaptchaResponse>, BetterCaptchaProps>(function BetterCaptcha(
	{ provider, ...props },
	ref,
) {
	const [loadedProvider, setLoadedProvider] = useState<{
		name: ProviderName;
		ProviderClass: RuntimeProviderClass;
	} | null>(null);
	const onErrorRef = useRef(props.onError);
	onErrorRef.current = props.onError;

	useEffect(() => {
		if (typeof provider !== "string") return;

		let cancelled = false;

		void loadProviderClass(provider).then(
			(ProviderClass) => {
				if (!cancelled) setLoadedProvider({ name: provider, ProviderClass });
			},
			(error: unknown) => {
				if (!cancelled) onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));
			},
		);

		return () => {
			cancelled = true;
		};
	}, [provider]);

	if (typeof provider !== "string") {
		return <BaseCaptcha ref={ref} ProviderClass={provider} {...props} />;
	}

	const ProviderClass = loadedProvider?.name === provider ? loadedProvider.ProviderClass : null;
	if (!ProviderClass) {
		return (
			<div id="better-captcha-loading" className={props.className} style={props.style} aria-live="polite" aria-busy />
		);
	}

	return <BaseCaptcha ref={ref} ProviderClass={ProviderClass} {...props} />;
});
