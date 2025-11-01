import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig } from "@better-captcha/core";
import { SvelteComponent } from "svelte";

export interface BaseCaptchaProps<
	TOptions,
	THandle extends CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle>,
> {
	providerClass: new (sitekey: string) => TProvider;
	sitekey: string;
	options?: TOptions;
	class?: string;
	style?: string;
	onready?: (handle: THandle) => void;
	onerror?: (error: Error) => void;
	onSolve?: (token: string) => void;
}

export default class BaseCaptcha<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
> extends SvelteComponent<BaseCaptchaProps<TOptions, THandle, TProvider>> {
	execute(): Promise<void>;
	reset(): void;
	destroy(): void;
	getResponse(): string;
	getComponentState(): CaptchaState;
}
