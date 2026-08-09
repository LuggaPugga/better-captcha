import type { CaptchaHandle, CaptchaResponse, ProviderName } from "@better-captcha/core";
import { BetterCaptcha } from "@better-captcha/lit";
import { html, type TemplateResult } from "lit";
import type { Ref } from "lit/directives/ref.js";
import { ref } from "lit/directives/ref.js";

export type CaptchaComponentMode = "dedicated" | "dynamic";

export type CaptchaRefElement<THandle extends CaptchaHandle<CaptchaResponse> = CaptchaHandle<CaptchaResponse>> =
	Element & {
		getHandle: () => THandle;
	};

type RenderCaptchaOptions<TToken, THandle extends CaptchaHandle<CaptchaResponse>> = {
	mode: CaptchaComponentMode;
	provider: ProviderName;
	captchaRef: Ref<CaptchaRefElement<THandle>>;
	dedicated: () => TemplateResult;
	sitekey?: string;
	endpoint?: string;
	options?: Record<string, unknown>;
	onSolve?: (token: TToken) => void;
};

export function renderCaptcha<TToken, THandle extends CaptchaHandle<CaptchaResponse> = CaptchaHandle<CaptchaResponse>>({
	mode,
	provider,
	captchaRef,
	dedicated,
	sitekey,
	endpoint,
	options,
	onSolve,
}: RenderCaptchaOptions<TToken, THandle>): TemplateResult {
	if (mode === "dynamic") {
		BetterCaptcha;

		const handleSolve = onSolve ? (token: CaptchaResponse) => onSolve(token as TToken) : undefined;

		return html`
			<better-captcha
				${ref(captchaRef)}
				provider=${provider}
				.sitekey=${sitekey}
				.endpoint=${endpoint}
				.options=${options}
				.onSolve=${handleSolve}
			></better-captcha>
		`;
	}

	return dedicated();
}
