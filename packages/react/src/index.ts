export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	WidgetId,
} from "@better-captcha/core";

export type CaptchaProps<TOptions> = {
	sitekey?: string;
	endpoint?: string;
	options?: TOptions;
	className?: string;
	style?: React.CSSProperties;
	autoRender?: boolean;
};

export { createCaptchaComponent } from "./base-captcha";
export { useCaptchaLifecycle } from "./use-captcha-lifecycle";
