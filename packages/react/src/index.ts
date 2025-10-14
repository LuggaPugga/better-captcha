export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	WidgetId,
} from "@better-captcha/core";

/**
 * Props for CAPTCHA components
 * @template TOptions - Type of options specific to the CAPTCHA provider
 */
export type CaptchaProps<TOptions> = {
	sitekey: string;
	options?: TOptions;
	className?: string;
	style?: React.CSSProperties;
};

export { createCaptchaComponent } from "./base-captcha";
export { useCaptchaLifecycle } from "./use-captcha-lifecycle";
