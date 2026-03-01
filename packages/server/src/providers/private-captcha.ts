import type { ReCaptchaCompatibleVerificationResult, ReCaptchaCompatibleVerifyOptions } from "./recaptcha-compatible";
import { verifyWithReCaptchaCompatibleApi } from "./recaptcha-compatible";

const PROVIDER = "private-captcha";

export type PrivateCaptchaErrorCode = string;
export type PrivateCaptchaVerificationResult = ReCaptchaCompatibleVerificationResult;

export interface PrivateCaptchaVerifyOptions extends ReCaptchaCompatibleVerifyOptions {}

export async function verifyPrivateCaptcha(
	options: PrivateCaptchaVerifyOptions,
): Promise<PrivateCaptchaVerificationResult> {
	return verifyWithReCaptchaCompatibleApi(PROVIDER, options);
}
