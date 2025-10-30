import type { CaptchaHandle } from "@better-captcha/core";
import type { SvelteComponent } from "svelte";

export type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	WidgetId,
} from "@better-captcha/core";

interface CaptchaPropsShared<TOptions = unknown> {
	options?: TOptions;
	class?: string;
	style?: string;
	autoRender?: boolean;
	onready?: (handle: CaptchaHandle) => void;
	onerror?: (error: Error) => void;
}

export type CaptchaProps<TOptions = unknown> = Omit<
	CaptchaPropsShared<TOptions> & {
		sitekey: string;
	},
	"endpoint"
>;

export type CaptchaPropsWithEndpoint<TOptions = unknown> = Omit<
	CaptchaPropsShared<TOptions> & {
		endpoint: string;
	},
	"sitekey"
>;

export interface CaptchaComponentMethods {
	execute(): Promise<void>;
	reset(): void;
	destroy(): void;
	getResponse(): string;
	getComponentState(): import("@better-captcha/core").CaptchaState;
	render(): Promise<void>;
}

export type CaptchaComponent<TOptions = unknown> = typeof SvelteComponent<CaptchaProps<TOptions>> &
	CaptchaComponentMethods;

export { type UseCaptchaReturn, useCaptcha } from "./composables/use-captcha";
