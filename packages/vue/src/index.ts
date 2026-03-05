import type { CaptchaHandle, ScriptOptions } from "@better-captcha/core";
import type { DefineComponent, StyleValue } from "vue";

export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";

export type CaptchaProps<TOptions, TSolve = string> = {
	sitekey?: string;
	endpoint?: string;
	options?: TOptions;
	scriptOptions?: ScriptOptions;
	class?: string;
	style?: StyleValue;
	autoRender?: boolean;
};

export interface CaptchaEmits<THandle extends CaptchaHandle<unknown> = CaptchaHandle, TSolve = string> {
	ready: (handle: THandle) => void;
	error: (error: Error) => void;
	solve: (token: TSolve) => void;
}

export type CaptchaComponent<TOptions, THandle extends CaptchaHandle<unknown> = CaptchaHandle, TSolve = string> = DefineComponent<
	CaptchaProps<TOptions, TSolve>,
	CaptchaEmits<THandle, TSolve>
>;

export { type UseCaptchaReturn, useCaptcha } from "./composables/use-captcha";
export { createCaptchaComponent } from "./create-captcha-component";
