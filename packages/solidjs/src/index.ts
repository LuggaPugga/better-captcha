import type { CaptchaHandle } from "@better-captcha/core";
import { createSignal, type JSX } from "solid-js";

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
 */
export type CaptchaProps<TOptions, THandle extends CaptchaHandle = CaptchaHandle> = Omit<
	JSX.HTMLAttributes<HTMLDivElement>,
	"children" | "className" | "style"
> & {
	sitekey?: string;
	endpoint?: string;
	options?: TOptions;
	class?: string;
	style?: JSX.CSSProperties;
	autoRender?: boolean;
	onReady?: (handle: THandle) => void;
	onError?: (error: Error) => void;
	controller?: CaptchaController<THandle>;
};

export { createCaptchaComponent } from "./base-captcha";

export type CaptchaController<THandle extends CaptchaHandle = CaptchaHandle> = {
	handle: () => THandle | null;
	set: (handle: THandle | null) => void;
};

export function createCaptchaController<THandle extends CaptchaHandle = CaptchaHandle>(): CaptchaController<THandle> {
	const [handle, setHandle] = createSignal<THandle | null>(null);

	return {
		handle,
		set: (h) => {
			setHandle(() => h as THandle | null);
		},
	};
}
