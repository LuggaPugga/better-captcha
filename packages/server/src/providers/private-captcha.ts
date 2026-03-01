import type { ReCaptchaCompatibleVerificationResult, ReCaptchaCompatibleVerifyOptions } from "./recaptcha-compatible";
import { createReCaptchaCompatibleVerifier } from "./recaptcha-compatible";

const PROVIDER = "private-captcha";

export type PrivateCaptchaErrorCode = string;
export type PrivateCaptchaVerificationResult = ReCaptchaCompatibleVerificationResult;
export type PrivateCaptchaVerifyOptions = ReCaptchaCompatibleVerifyOptions;

export const verifyPrivateCaptcha = createReCaptchaCompatibleVerifier(PROVIDER);
