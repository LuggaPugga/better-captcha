export { CaptchaServerError, type CaptchaServerErrorCode, isCaptchaServerError } from "./errors";
export {
	type CaptchaFoxErrorCode,
	type CaptchaFoxVerificationResult,
	type CaptchaFoxVerifyOptions,
	verifyCaptchaFox,
} from "./providers/captcha-fox";
export {
	type FriendlyCaptchaErrorCode,
	type FriendlyCaptchaSuccessData,
	type FriendlyCaptchaVerificationResult,
	type FriendlyCaptchaVerifyOptions,
	verifyFriendlyCaptcha,
} from "./providers/friendly-captcha";
export {
	type HCaptchaErrorCode,
	type HCaptchaSuccessData,
	type HCaptchaVerificationResult,
	type HCaptchaVerifyOptions,
	verifyHCaptcha,
} from "./providers/hcaptcha";
export {
	type PrivateCaptchaErrorCode,
	type PrivateCaptchaVerificationResult,
	type PrivateCaptchaVerifyOptions,
	verifyPrivateCaptcha,
} from "./providers/private-captcha";
export {
	type ProsopoErrorCode,
	type ProsopoVerificationResult,
	type ProsopoVerifyOptions,
	verifyProsopo,
} from "./providers/prosopo";
export {
	type ReCaptchaErrorCode,
	type ReCaptchaSuccessData,
	type ReCaptchaVerificationResult,
	type ReCaptchaVerifyOptions,
	verifyReCaptcha,
} from "./providers/recaptcha";
export {
	type ReCaptchaCompatibleErrorCode,
	type ReCaptchaCompatibleSuccessData,
	type ReCaptchaCompatibleVerificationResult,
	type ReCaptchaCompatibleVerifyOptions,
	verifyReCaptchaCompatible,
	verifyWithReCaptchaCompatibleApi,
} from "./providers/recaptcha-compatible";
export {
	type TurnstileErrorCode,
	type TurnstileSuccessData,
	type TurnstileVerificationResult,
	type TurnstileVerifyOptions,
	verifyTurnstile,
} from "./providers/turnstile";
export type { VerificationFailure, VerificationResult, VerificationSuccess } from "./result";
export type { VerificationCallbacks } from "./shared";

import { verifyCaptchaFox } from "./providers/captcha-fox";
import { verifyFriendlyCaptcha } from "./providers/friendly-captcha";
import { verifyHCaptcha } from "./providers/hcaptcha";
import { verifyPrivateCaptcha } from "./providers/private-captcha";
import { verifyProsopo } from "./providers/prosopo";
import { verifyReCaptcha } from "./providers/recaptcha";
import { verifyReCaptchaCompatible } from "./providers/recaptcha-compatible";
import { verifyTurnstile } from "./providers/turnstile";

export const PROVIDER_VERIFIERS = {
	turnstile: verifyTurnstile,
	recaptcha: verifyReCaptcha,
	"recaptcha-v3": verifyReCaptcha,
	hcaptcha: verifyHCaptcha,
	"friendly-captcha": verifyFriendlyCaptcha,
	"recaptcha-compatible": verifyReCaptchaCompatible,
	"captcha-fox": verifyCaptchaFox,
	"private-captcha": verifyPrivateCaptcha,
	prosopo: verifyProsopo,
} as const;

export type BuiltInServerProvider = keyof typeof PROVIDER_VERIFIERS;
type ProviderVerifierMap = typeof PROVIDER_VERIFIERS;
type ProviderOptions<TProvider extends BuiltInServerProvider> = Parameters<ProviderVerifierMap[TProvider]>[0];
type ProviderResult<TProvider extends BuiltInServerProvider> = Awaited<ReturnType<ProviderVerifierMap[TProvider]>>;

export type BuiltInProviderMap = {
	[TProvider in BuiltInServerProvider]: {
		options: ProviderOptions<TProvider>;
		result: ProviderResult<TProvider>;
	};
};

export async function verifyToken<TProvider extends BuiltInServerProvider>(
	provider: TProvider,
	options: ProviderOptions<TProvider>,
): Promise<ProviderResult<TProvider>> {
	const verifier = PROVIDER_VERIFIERS[provider] as (
		input: ProviderOptions<TProvider>,
	) => Promise<ProviderResult<TProvider>>;
	return verifier(options);
}
