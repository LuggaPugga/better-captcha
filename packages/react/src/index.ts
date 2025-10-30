export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	WidgetId,
} from "@better-captcha/core";

type CaptchaSharedProps<TOptions> = {
	options?: TOptions;
	className?: string;
	style?: React.CSSProperties;
	autoRender?: boolean;
};

export type CaptchaProps<TOptions> = CaptchaSharedProps<TOptions> & {
	sitekey: string;
};

export type CaptchaPropsWithEndpoint<TOptions> = CaptchaSharedProps<TOptions> & {
	endpoint: string;
};

export { createCaptchaComponent, createCaptchaComponentWithEndpoint } from "./base-captcha";
export { useCaptchaLifecycle } from "./use-captcha-lifecycle";
