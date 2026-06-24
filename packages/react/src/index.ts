import type { CaptchaHandle, CaptchaResponse, ScriptOptions } from "@better-captcha/core";

export type CaptchaProps<
	TOptions,
	TSolve = string,
	THandle extends CaptchaHandle<unknown> = CaptchaHandle<CaptchaResponse>,
> = {
	sitekey?: string;
	endpoint?: string;
	options?: TOptions;
	scriptOptions?: ScriptOptions;
	className?: string;
	style?: React.CSSProperties;
	autoRender?: boolean;
	onReady?: (handle: THandle) => void;
	onSolve?: (token: TSolve) => void;
	onError?: (error: Error | string) => void;
};

export { BaseCaptcha } from "./base-captcha";
export { BetterCaptcha } from "./better-captcha";
export { useCaptchaLifecycle } from "./use-captcha-lifecycle";
