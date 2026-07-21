import type {
	CaptchaHandle,
	CaptchaResponse,
	Provider,
	ProviderConfig,
	ProviderName,
	ScriptOptions,
} from "@better-captcha/core";
import { loadProviderClass } from "@better-captcha/core";
import { $, component$ } from "@builder.io/qwik";
import type { CaptchaProps } from "./index";
import { useCaptchaLifecycle } from "./use-captcha-lifecycle";

type DynamicHandle = CaptchaHandle<CaptchaResponse>;
type DynamicProvider = Provider<
	Record<string, unknown>,
	DynamicHandle,
	CaptchaResponse,
	CaptchaResponse
>;

export type BetterCaptchaProps = CaptchaProps<
	Record<string, unknown>,
	DynamicHandle,
	CaptchaResponse
> & {
	provider: ProviderName;
};

export const BetterCaptcha = component$<BetterCaptchaProps>((props) => {
	const providerFactory$ = $(async (identifier: string, scriptOptions?: ScriptOptions) => {
		const ProviderClass = await loadProviderClass(props.provider);
		return new ProviderClass(identifier, scriptOptions) as DynamicProvider;
	});
	const { hostEl, elementId, isLoading } = useCaptchaLifecycle<
		Record<string, unknown>,
		CaptchaResponse,
		CaptchaResponse,
		DynamicHandle,
		DynamicProvider
	>(providerFactory$, props);

	return (
		<div
			id={elementId.value}
			ref={hostEl}
			class={props.class}
			style={props.style}
			aria-live="polite"
			aria-busy={isLoading.value}
		/>
	);
});
