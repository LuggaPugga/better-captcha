import type { CaptchaHandle, CaptchaResponse, ProviderName } from "@better-captcha/core";
import { BetterCaptcha, type BetterCaptchaProps } from "@better-captcha/preact";
import { type ComponentType, h, type Ref, type VNode } from "preact";
import { forwardRef } from "preact/compat";

export type CaptchaComponentMode = "dedicated" | "dynamic";

type RuntimeProps = {
	mode: CaptchaComponentMode;
	provider: ProviderName;
	component: unknown;
} & Record<string, unknown>;

const RuntimeRenderCaptcha = forwardRef<CaptchaHandle<CaptchaResponse>, RuntimeProps>(
	({ mode, provider, component, ...props }, ref) => {
		const Component = component as ComponentType<Record<string, unknown>>;
		return mode === "dynamic"
			? h(BetterCaptcha, { ...props, provider, ref } as BetterCaptchaProps & {
					ref: Ref<CaptchaHandle<CaptchaResponse>>;
				})
			: h(Component, { ...props, ref });
	},
);

export const RenderCaptcha = RuntimeRenderCaptcha as <TProps extends object, THandle>(
	props: TProps & {
		mode: CaptchaComponentMode;
		provider: ProviderName;
		component: ComponentType<TProps>;
		ref?: Ref<THandle>;
	},
) => VNode | null;
