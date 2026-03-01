import type { ReCaptchaCompatibleVerificationResult, ReCaptchaCompatibleVerifyOptions } from "./recaptcha-compatible";
import { verifyWithReCaptchaCompatibleApi } from "./recaptcha-compatible";

const PROVIDER = "prosopo";

export type ProsopoErrorCode = string;
export type ProsopoVerificationResult = ReCaptchaCompatibleVerificationResult;

export interface ProsopoVerifyOptions extends ReCaptchaCompatibleVerifyOptions {}

export async function verifyProsopo(options: ProsopoVerifyOptions): Promise<ProsopoVerificationResult> {
	return verifyWithReCaptchaCompatibleApi(PROVIDER, options);
}
