import type { CaptchaHandle } from "@better-captcha/core";
import type { DefineComponent, StyleValue } from "vue";

export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	WidgetId,
} from "@better-captcha/core";

export interface CaptchaProps<TOptions> {
	sitekey?: string;
	endpoint?: string;
	options?: TOptions;
	class?: string;
	style?: StyleValue;
	autoRender?: boolean;
}

export interface CaptchaEmits<THandle extends CaptchaHandle = CaptchaHandle> {
	ready: (handle: THandle) => void;
	error: (error: Error) => void;
}

export type CaptchaComponent<TOptions, THandle extends CaptchaHandle = CaptchaHandle> = DefineComponent<
	CaptchaProps<TOptions>,
	CaptchaEmits<THandle>
>;

export { type UseCaptchaReturn, useCaptcha } from "./composables/use-captcha";
export { createCaptchaComponent } from "./create-captcha-component";
