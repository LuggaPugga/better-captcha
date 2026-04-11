"use client";

import type { CaptchaResponse, ProviderName, RuntimeProviderClass } from "@better-captcha/core";
import { loadProviderClass } from "@better-captcha/core";
import { lazy, Suspense, useMemo } from "react";
import type { CaptchaProps } from ".";
import { createCaptchaComponent } from "./base-captcha";

type BetterCaptchaProps = CaptchaProps<object, CaptchaResponse> & {
	provider: ProviderName | RuntimeProviderClass;
};

async function getDynamicCaptchaComponent(name: ProviderName) {
	const ProviderClass = await loadProviderClass(name);
	return createCaptchaComponent(ProviderClass);
}

export function BetterCaptcha({ provider, ...captchaProps }: BetterCaptchaProps) {
	const CaptchaProviderComponent = useMemo(() => {
		if (typeof provider === "string") {
			return lazy(() =>
				getDynamicCaptchaComponent(provider).then((Component) => ({
					default: Component,
				})),
			);
		}

		return createCaptchaComponent(provider);
	}, [provider]);

	return (
		<Suspense>
			<CaptchaProviderComponent {...captchaProps} />
		</Suspense>
	);
}
