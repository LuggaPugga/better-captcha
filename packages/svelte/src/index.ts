import type { CaptchaHandle } from "@better-captcha/core";
import type { SvelteComponent } from "svelte";

export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	WidgetId,
} from "@better-captcha/core";

export interface CaptchaProps<TOptions = unknown> {
	sitekey: string;
	options?: TOptions;
	class?: string;
	style?: string;
	onready?: (handle: CaptchaHandle) => void;
	onerror?: (error: Error) => void;
}

export interface CaptchaComponentMethods {
	execute(): Promise<void>;
	reset(): void;
	destroy(): void;
	getResponse(): string;
	getComponentState(): import("@better-captcha/core").CaptchaState;
	showCaptcha(): Promise<void>;
}

export type CaptchaComponent<TOptions = unknown> = typeof SvelteComponent<CaptchaProps<TOptions>> &
	CaptchaComponentMethods;

export { type UseCaptchaReturn, useCaptcha } from "./composables/use-captcha";
