import type { ProviderName } from "@better-captcha/core";
import { BetterCaptcha } from "@better-captcha/solidjs";
import { dynamic } from "@solidjs/web";
import { type Component, omit } from "solid-js";

export type CaptchaComponentMode = "dedicated" | "dynamic";

type RenderCaptchaProps = {
	mode: CaptchaComponentMode;
	provider: ProviderName;
	component: unknown;
	[key: string]: unknown;
};

export function RenderCaptcha(props: RenderCaptchaProps) {
	const captchaProps = omit(props, "mode", "provider", "component");
	const Captcha = dynamic(() =>
		props.mode === "dynamic" ? BetterCaptcha : (props.component as Component<Record<string, unknown>>),
	) as Component<Record<string, unknown>>;
	return <Captcha {...captchaProps} {...(props.mode === "dynamic" ? { provider: props.provider } : {})} />;
}
