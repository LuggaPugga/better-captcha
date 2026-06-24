import type { ProviderName } from "@better-captcha/core";
import { BetterCaptcha } from "@better-captcha/react";

export type CaptchaComponentMode = "dedicated" | "dynamic";

type RenderCaptchaProps = {
	mode: CaptchaComponentMode;
	provider: ProviderName;
	component: React.ComponentType<any>;
} & Record<string, unknown>;

export function RenderCaptcha({ mode, provider, component: Component, ...props }: RenderCaptchaProps) {
	if (mode === "dynamic") {
		return <BetterCaptcha provider={provider} {...props} />;
	}

	return <Component {...props} />;
}
