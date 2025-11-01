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
	onReady?: () => void;
	onSolve?: (token: string) => void;
	onError?: (error: Error | string) => void;
};

export { createCaptchaComponent } from "./base-captcha";
export { useCaptchaLifecycle } from "./use-captcha-lifecycle";
