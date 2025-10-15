import type { CaptchaHandle, CaptchaState } from "@better-captcha/core";
import { type Ref, ref, type ShallowRef, shallowRef, watch } from "vue";

export function useCaptcha<THandle extends CaptchaHandle = CaptchaHandle>(): UseCaptchaReturn<THandle> {
	const captchaRef: ShallowRef<THandle | null> = shallowRef(null);
	const state = ref<CaptchaState>({
		loading: true,
		error: null,
		ready: false,
	});

	const execute = async (): Promise<void> => {
		if (captchaRef.value) {
			await captchaRef.value.execute();
		}
	};

	const reset = (): void => {
		if (captchaRef.value) {
			captchaRef.value.reset();
		}
	};

	const destroy = (): void => {
		if (captchaRef.value) {
			captchaRef.value.destroy();
		}
	};

	const getResponse = (): string => {
		return captchaRef.value?.getResponse() ?? "";
	};

	watch(
		captchaRef,
		(handle) => {
			if (handle) {
				state.value = handle.getComponentState();
			}
		},
		{ immediate: true },
	);

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
	captchaRef: ShallowRef<THandle | null>;
	state: Ref<CaptchaState>;
	execute: () => Promise<void>;
	reset: () => void;
	destroy: () => void;
	getResponse: () => string;
};
