import type { CaptchaHandle } from "@better-captcha/core";
import type { DefineComponent, StyleValue } from "vue";

export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	WidgetId,
} from "@better-captcha/core";

interface CaptchaPropsShared<TOptions> {
	options?: TOptions;
	class?: string;
	style?: StyleValue;
	autoRender?: boolean;
}

export type CaptchaProps<TOptions> = Omit<
	CaptchaPropsShared<TOptions> & {
		sitekey: string;
	},
	"endpoint"
>;

export type CaptchaPropsWithEndpoint<TOptions> = Omit<
	CaptchaPropsShared<TOptions> & {
		endpoint: string;
	},
	"sitekey"
>;

export interface CaptchaEmits<THandle extends CaptchaHandle = CaptchaHandle> {
	ready: (handle: THandle) => void;
	error: (error: Error) => void;
}

export type CaptchaComponent<TOptions, THandle extends CaptchaHandle = CaptchaHandle> = DefineComponent<
	CaptchaProps<TOptions>,
	CaptchaEmits<THandle>
>;

export { type UseCaptchaReturn, useCaptcha } from "./composables/use-captcha";
export { createCaptchaComponent, createCaptchaComponentWithEndpoint } from "./create-captcha-component";
