import type { CaptchaHandle } from "@better-captcha/core";
import type { NoSerialize, QRL, Signal } from "@builder.io/qwik";
import { useSignal } from "@builder.io/qwik";

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
 * @template THandle - Type of handle returned by the CAPTCHA provider
 */
export type CaptchaProps<TOptions, THandle extends CaptchaHandle = CaptchaHandle> = {
	sitekey?: string;
	endpoint?: string;
	options?: TOptions;
	class?: string;
	style?: string | Record<string, string | number>;
	onReady?: QRL<(handle: NoSerialize<THandle>) => void>;
	onError?: QRL<(error: Error) => void>;
	controller?: Signal<NoSerialize<THandle> | null>;
};

export { createCaptchaComponent } from "./base-captcha";

export type CaptchaController<THandle extends CaptchaHandle = CaptchaHandle> = Signal<NoSerialize<THandle> | null>;

/**
 * Creates a controller for managing CAPTCHA component instances
 * @template THandle - Type of handle returned by the CAPTCHA provider
 * @returns A signal that can be used to control the CAPTCHA component
 */
export function useCaptchaController<THandle extends CaptchaHandle = CaptchaHandle>(): CaptchaController<THandle> {
	return useSignal<NoSerialize<THandle> | null>(null);
}
