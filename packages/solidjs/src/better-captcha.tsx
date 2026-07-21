import type {
	CaptchaHandle,
	CaptchaResponse,
	Provider,
	ProviderName,
	RuntimeProviderClass,
	ScriptOptions,
} from "@better-captcha/core";
import { loadProviderClass } from "@better-captcha/core";
import { createEffect, createMemo, createResource, type JSX, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { createCaptchaComponent } from "./base-captcha";
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

export function BetterCaptcha(allProps: BetterCaptchaProps): JSX.Element {
	const [props, divProps] = splitProps(allProps, ["provider", "onError", "class", "style"]);
	const [loadedProvider] = createResource(
		() => (typeof props.provider === "string" ? props.provider : undefined),
		loadProviderClass,
	);
	const ProviderClass = createMemo(() => {
		if (typeof props.provider !== "string") return props.provider;
		return loadedProvider.loading ? undefined : loadedProvider();
	});
	const Component = createMemo(() => {
		const activeProvider = ProviderClass();
		return activeProvider
			? createCaptchaComponent<Record<string, unknown>, CaptchaResponse, CaptchaResponse, DynamicHandle>(
					activeProvider as unknown as DynamicProviderClass,
				)
			: null;
	});

	createEffect(() => {
		const error = loadedProvider.error;
		if (error) props.onError?.(error instanceof Error ? error : new Error(String(error)));
	});

	return (
		<Show
			when={Component()}
			fallback={
				<div
					{...divProps}
					id="better-captcha-loading"
					class={props.class}
					style={props.style}
					aria-live="polite"
					aria-busy={true}
				/>
			}
		>
			{(ActiveComponent) => (
				<Dynamic
					component={ActiveComponent()}
					{...divProps}
					class={props.class}
					style={props.style}
					onError={props.onError}
				/>
			)}
		</Show>
	);
}
