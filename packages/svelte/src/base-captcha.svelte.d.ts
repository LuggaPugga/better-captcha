import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";
import { SvelteComponent } from "svelte";

export interface BaseCaptchaProps<
	TOptions,
	TResponse,
	TSolve,
	THandle extends CaptchaHandle<TResponse>,
	TProvider extends Provider<ProviderConfig, TOptions, THandle, TResponse, TSolve>,
> {
	providerClass: new (sitekeyOrEndpoint: string, scriptOptions?: ScriptOptions) => TProvider;
	value: string;
	options?: TOptions;
	scriptOptions?: ScriptOptions;
	class?: string;
	style?: string;
	autoRender?: boolean;
	onready?: (handle: THandle) => void;
	onerror?: (error: Error) => void;
	onSolve?: (token: TSolve) => void;
}

export default class BaseCaptcha<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
	TProvider extends Provider<ProviderConfig, TOptions, THandle, TResponse, TSolve> = Provider<
		ProviderConfig,
		TOptions,
		THandle,
		TResponse,
		TSolve
	>,
> extends SvelteComponent<BaseCaptchaProps<TOptions, TResponse, TSolve, THandle, TProvider>> {
	execute(): Promise<void>;
	reset(): void;
	destroy(): void;
	getResponse(): ReturnType<THandle["getResponse"]> | undefined;
	getComponentState(): CaptchaState;
	render(): Promise<void>;
}
