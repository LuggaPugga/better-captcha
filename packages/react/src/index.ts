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

/**
 * Base props for CAPTCHA components with sitekey
 * @template TOptions - Type of options specific to the CAPTCHA provider
 */
export type CaptchaProps<TOptions> = CaptchaSharedProps<TOptions> & {
	sitekey: string;
	endpoint?: never;
};

/**
 * Props for CAPTCHA components with endpoint (CapWidget only)
 * @template TOptions - Type of options specific to the CAPTCHA provider
 */
export type CaptchaPropsWithEndpoint<TOptions> = CaptchaSharedProps<TOptions> & {
	endpoint: string;
	sitekey?: never;
};

export { createCaptchaComponent, createCaptchaComponentWithEndpoint } from "./base-captcha";
export { useCaptchaLifecycle } from "./use-captcha-lifecycle";
