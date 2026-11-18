import type {
	CaptchaHandle,
	CaptchaResponse,
	Provider,
	ProviderName,
	RuntimeProviderClass,
	ScriptOptions,
} from "@better-captcha/core";
import { loadProviderClass } from "@better-captcha/core";
import { dynamic, type JSX } from "@solidjs/web";
import { Loading, omit, untrack } from "solid-js";
import { CAPTCHA_PROP_KEYS, createCaptchaComponent } from "./base-captcha";
import type { CaptchaProps } from "./index";

export type BetterCaptchaProps = CaptchaProps<
	Record<string, unknown>,
	CaptchaHandle<CaptchaResponse>,
	CaptchaResponse
> & {
	provider: ProviderName | RuntimeProviderClass;
};

type DynamicHandle = CaptchaHandle<CaptchaResponse>;
type DynamicProviderClass = new (
	identifier: string,
	scriptOptions?: ScriptOptions,
) => Provider<Record<string, unknown>, DynamicHandle, CaptchaResponse, CaptchaResponse>;

const toCaptchaComponent = (providerClass: RuntimeProviderClass) =>
	createCaptchaComponent<Record<string, unknown>, CaptchaResponse, CaptchaResponse, DynamicHandle>(
		providerClass as unknown as DynamicProviderClass,
	);

export function BetterCaptcha(props: BetterCaptchaProps): JSX.Element {
	const captchaProps = omit(props, "provider");
	const placeholderProps = omit(props, "provider", ...CAPTCHA_PROP_KEYS);

	const Placeholder = () => (
		<div
			{...placeholderProps}
			id="better-captcha-loading"
			class={props.class}
			style={props.style}
			aria-live="polite"
			aria-busy="true"
		/>
	);

	// Provider classes are lazy-loaded by name; a pending load renders the <Loading> fallback.
	const Captcha = dynamic(() => {
		const provider = props.provider;
		if (typeof provider !== "string") return toCaptchaComponent(provider);
		return Promise.resolve(provider)
			.then(loadProviderClass)
			.then(toCaptchaComponent, (error: unknown) => {
				untrack(() => props.onError)?.(error instanceof Error ? error : new Error(String(error)));
				return Placeholder;
			});
	});

	return (
		<Loading fallback={<Placeholder />} on={props.provider}>
			<Captcha {...captchaProps} />
		</Loading>
	);
}
