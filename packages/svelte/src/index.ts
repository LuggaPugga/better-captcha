import type { CaptchaHandle, ScriptOptions } from "@better-captcha/core";
import type { SvelteComponent } from "svelte";

export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";

export interface CaptchaProps<
	TOptions = unknown,
	TSolve = string,
	THandle extends CaptchaHandle<unknown> = CaptchaHandle,
> {
	sitekey?: string;
	endpoint?: string;
	options?: TOptions;
	scriptOptions?: ScriptOptions;
	class?: string;
	style?: string;
	autoRender?: boolean;
	onready?: (handle: THandle) => void;
	onerror?: (error: Error) => void;
	onSolve?: (token: TSolve) => void;
}

export interface CaptchaComponentMethods<THandle extends CaptchaHandle<unknown> = CaptchaHandle> {
	execute(): Promise<void>;
	reset(): void;
	destroy(): void;
	getResponse(): ReturnType<THandle["getResponse"]> | undefined;
	getComponentState(): import("@better-captcha/core").CaptchaState;
	render(): Promise<void>;
}

export type CaptchaComponent<
	TOptions = unknown,
	TSolve = string,
	THandle extends CaptchaHandle<unknown> = CaptchaHandle,
> = typeof SvelteComponent<CaptchaProps<TOptions, TSolve, THandle>> & CaptchaComponentMethods<THandle>;

export { type UseCaptchaReturn, useCaptcha } from "./composables/use-captcha";
