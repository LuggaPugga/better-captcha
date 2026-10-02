import type { CaptchaHandle, ScriptOptions } from "@better-captcha/core";
import type { NoSerialize, QRL, Signal } from "@builder.io/qwik";
import { useSignal } from "@builder.io/qwik";

export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";

export type CaptchaProps<TOptions, THandle extends CaptchaHandle<unknown> = CaptchaHandle, TSolve = string> = {
	sitekey?: string;
	endpoint?: string;
	options?: TOptions;
	scriptOptions?: ScriptOptions;
	class?: string;
	style?: string | Record<string, string | number>;
	onReady$?: QRL<(handle: NoSerialize<THandle>) => unknown>;
	onError$?: QRL<(error: Error) => void>;
	onSolve$?: QRL<(token: TSolve) => void>;
	controller?: Signal<NoSerialize<THandle> | null>;
	autoRender?: boolean;
};

export { createCaptchaComponent } from "./base-captcha";
export { BetterCaptcha, type BetterCaptchaProps } from "./better-captcha";
export { useCaptchaLifecycle } from "./use-captcha-lifecycle";

export type CaptchaController<THandle extends CaptchaHandle<unknown> = CaptchaHandle> = Signal<
	NoSerialize<THandle> | null
>;

/** Create a signal for the component's imperative handle. */
export function useCaptchaController<THandle extends CaptchaHandle<unknown> = CaptchaHandle>(): CaptchaController<THandle> {
	return useSignal<NoSerialize<THandle> | null>(null);
}
