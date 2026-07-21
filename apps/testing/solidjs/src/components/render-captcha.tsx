import type { ProviderName } from "@better-captcha/core";
import { BetterCaptcha } from "@better-captcha/solidjs";
import { type Component, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

export type CaptchaComponentMode = "dedicated" | "dynamic";

type RenderCaptchaProps = {
	mode: CaptchaComponentMode;
	provider: ProviderName;
	component: unknown;
	[key: string]: unknown;
};

export function RenderCaptcha(props: RenderCaptchaProps) {
	const [local, captchaProps] = splitProps(props, ["mode", "provider", "component"]);
	const DedicatedComponent = local.component as Component<Record<string, unknown>>;
	return (
		<Dynamic
			component={local.mode === "dynamic" ? BetterCaptcha : DedicatedComponent}
			{...captchaProps}
			{...(local.mode === "dynamic" ? { provider: local.provider } : {})}
		/>
	);
}
