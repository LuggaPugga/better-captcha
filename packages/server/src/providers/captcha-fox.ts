import type { ReCaptchaCompatibleVerificationResult, ReCaptchaCompatibleVerifyOptions } from "./recaptcha-compatible";
import { createReCaptchaCompatibleVerifier } from "./recaptcha-compatible";

const PROVIDER = "captcha-fox";

export type CaptchaFoxErrorCode = string;
export type CaptchaFoxVerificationResult = ReCaptchaCompatibleVerificationResult;
export type CaptchaFoxVerifyOptions = ReCaptchaCompatibleVerifyOptions;

export const verifyCaptchaFox = createReCaptchaCompatibleVerifier(PROVIDER);
