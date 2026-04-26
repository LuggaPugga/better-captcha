"use client";

import type { CaptchaHandle, CaptchaResponse, ProviderName, RuntimeProviderClass } from "@better-captcha/core";
import { loadProviderClass } from "@better-captcha/core";
import { forwardRef, useEffect, useState } from "react";
import type { CaptchaProps } from ".";
import { BaseCaptcha } from "./base-captcha";

type BetterCaptchaHandle = CaptchaHandle<CaptchaResponse>;

type BetterCaptchaProps = CaptchaProps<object, CaptchaResponse, BetterCaptchaHandle> & {
	provider: ProviderName | RuntimeProviderClass;
};

const providerClassCache = new Map<ProviderName, Promise<RuntimeProviderClass>>();

function getProviderClass(name: ProviderName) {
	const cached = providerClassCache.get(name);
	if (cached) return cached;

	const providerClass = loadProviderClass(name);
	providerClassCache.set(name, providerClass);
	return providerClass;
}

export const BetterCaptcha = forwardRef<BetterCaptchaHandle, BetterCaptchaProps>(function BetterCaptcha(
	{ provider, ...captchaProps },
	ref,
) {
	const [resolvedProvider, setResolvedProvider] = useState<{
		name: ProviderName;
		ProviderClass: RuntimeProviderClass;
	} | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;
		setLoadError(null);

		if (typeof provider !== "string") {
			setResolvedProvider(null);
			return;
		}

		setResolvedProvider(null);
		void getProviderClass(provider).then(
			(ProviderClass) => {
				if (!cancelled) setResolvedProvider({ name: provider, ProviderClass });
			},
			(error) => {
				if (cancelled) return;
				const err = error instanceof Error ? error : new Error(String(error));
				captchaProps.onError?.(err);
				setLoadError(err);
			},
		);

		return () => {
			cancelled = true;
		};
	}, [provider, captchaProps.onError]);

	if (loadError) throw loadError;

	if (typeof provider !== "string") {
		return <BaseCaptcha ref={ref} ProviderClass={provider} {...captchaProps} />;
	}

	if (!resolvedProvider || resolvedProvider.name !== provider) return null;

	return <BaseCaptcha ref={ref} ProviderClass={resolvedProvider.ProviderClass} {...captchaProps} />;
});
