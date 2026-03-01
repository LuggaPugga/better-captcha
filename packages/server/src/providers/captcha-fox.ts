import type { ReCaptchaCompatibleVerificationResult, ReCaptchaCompatibleVerifyOptions } from "./recaptcha-compatible";
import { verifyWithReCaptchaCompatibleApi } from "./recaptcha-compatible";

const PROVIDER = "captcha-fox";

export type CaptchaFoxErrorCode = string;
export type CaptchaFoxVerificationResult = ReCaptchaCompatibleVerificationResult;

export interface CaptchaFoxVerifyOptions extends ReCaptchaCompatibleVerifyOptions {}

export async function verifyCaptchaFox(options: CaptchaFoxVerifyOptions): Promise<CaptchaFoxVerificationResult> {
	return verifyWithReCaptchaCompatibleApi(PROVIDER, options);
}
