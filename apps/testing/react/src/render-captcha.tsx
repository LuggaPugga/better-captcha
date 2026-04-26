import type { ComponentProps, ComponentType } from "react";
import { BetterCaptcha } from "@better-captcha/react";

export type CaptchaComponentMode = "dedicated" | "dynamic";

type RenderCaptchaProps = {
	mode: CaptchaComponentMode;
	provider: ComponentProps<typeof BetterCaptcha>["provider"];
	component: ComponentType<any>;
} & Record<string, unknown>;

export function RenderCaptcha({ mode, provider, component: Component, ...props }: RenderCaptchaProps) {
	if (mode === "dynamic") {
		return <BetterCaptcha provider={provider} {...props} />;
	}

	return <Component {...props} />;
}
