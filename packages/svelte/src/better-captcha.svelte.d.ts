import type {
	CaptchaHandle,
	CaptchaResponse,
	CaptchaState,
	ProviderName,
	RuntimeProviderClass,
} from "@better-captcha/core";
import { SvelteComponent } from "svelte";
import type { CaptchaComponentMethods, CaptchaProps } from "./index.js";

type BetterCaptchaProps = CaptchaProps<Record<string, unknown>> & {
	provider: ProviderName | RuntimeProviderClass;
};

declare class BetterCaptcha
	extends SvelteComponent<BetterCaptchaProps>
	implements CaptchaComponentMethods<CaptchaHandle<CaptchaResponse>>
{
	execute(): Promise<void>;
	reset(): void;
	destroy(): void;
	getResponse(): ReturnType<CaptchaHandle<CaptchaResponse>["getResponse"]> | undefined;
	getComponentState(): CaptchaState;
	render(): Promise<void>;
}

export default BetterCaptcha;
