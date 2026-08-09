import type { CaptchaHandle, Provider, ProviderConfig, ScriptOptions } from "@better-captcha/core";
import type { QRL } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import type { CaptchaProps } from "./index";
import { useCaptchaLifecycle } from "./use-captcha-lifecycle";

export function createCaptchaComponent<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
	TProvider extends Provider<
	TOptions,
		THandle,
		TResponse,
		TSolve
	> = Provider<TOptions, THandle, TResponse, TSolve>,
>(
	providerFactory$: QRL<(identifier: string, scriptOptions?: ScriptOptions) => TProvider | Promise<TProvider>>,
) {
	return component$<CaptchaProps<TOptions, THandle, TSolve>>((props) => {
		const identifier = props.sitekey || props.endpoint;
		if (!identifier) {
			throw new Error("Either 'sitekey' or 'endpoint' prop must be provided");
		}

		const { hostEl, elementId, isLoading } = useCaptchaLifecycle<
			TOptions,
			TResponse,
			TSolve,
			THandle,
			TProvider
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
}
