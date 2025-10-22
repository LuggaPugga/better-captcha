import type { CaptchaHandle, CaptchaState } from "@better-captcha/core";
import { get, type Writable, writable } from "svelte/store";

export function useCaptcha<THandle extends CaptchaHandle = CaptchaHandle>(): UseCaptchaReturn<THandle> {
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

	const getResponse = (): string => {
		const handle = get(captchaRef);
		return handle?.getResponse() ?? "";
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

export type UseCaptchaReturn<THandle extends CaptchaHandle = CaptchaHandle> = {
	captchaRef: Writable<THandle | null>;
	state: Writable<CaptchaState>;
	execute: () => Promise<void>;
	reset: () => void;
	destroy: () => void;
	getResponse: () => string;
};
