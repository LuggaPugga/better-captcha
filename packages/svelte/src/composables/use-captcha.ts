import type { CaptchaHandle, CaptchaState } from "@better-captcha/core";
import { get, type Writable, writable } from "svelte/store";

export function useCaptcha<
	TResponse = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
>(): UseCaptchaReturn<TResponse, THandle> {
	const captchaRef: Writable<THandle | null> = writable(null);
	const state: Writable<CaptchaState> = writable({
		loading: true,
		error: null,
		ready: false,
	});

	captchaRef.subscribe((handle) => {
		if (handle) {
			state.set(handle.getComponentState());
		}
	});

	const execute = async (): Promise<void> => {
		const handle = get(captchaRef);
		if (handle) {
			await handle.execute();
		}
	};

	const reset = (): void => {
		const handle = get(captchaRef);
		handle?.reset();
	};

	const destroy = (): void => {
		const handle = get(captchaRef);
		handle?.destroy();
	};

	const getResponse = (): TResponse | undefined => {
		const handle = get(captchaRef);
		return handle?.getResponse();
	};

	return {
		captchaRef,
		state,
		execute,
		reset,
		destroy,
		getResponse,
	};
}

export type UseCaptchaReturn<
	TResponse = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
> = {
	captchaRef: Writable<THandle | null>;
	state: Writable<CaptchaState>;
	execute: () => Promise<void>;
	reset: () => void;
	destroy: () => void;
	getResponse: () => TResponse | undefined;
};
