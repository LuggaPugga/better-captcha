import type { ProviderName } from "@better-captcha/core";
import { BetterCaptcha } from "@better-captcha/qwik";
import { type Component, component$ } from "@builder.io/qwik";

export type CaptchaComponentMode = "dedicated" | "dynamic";

type RenderCaptchaProps = {
	mode: CaptchaComponentMode;
	provider: ProviderName;
	component: unknown;
	[key: string]: unknown;
};

export const RenderCaptcha = component$<RenderCaptchaProps>((props) => {
	const { mode, provider, component, ...captchaProps } = props;
	const DedicatedComponent = component as Component<Record<string, unknown>>;
	const RuntimeCaptcha = BetterCaptcha as unknown as Component<Record<string, unknown>>;
	return mode === "dynamic" ? (
		<RuntimeCaptcha provider={provider} {...captchaProps} />
	) : (
		<DedicatedComponent {...captchaProps} />
	);
});
