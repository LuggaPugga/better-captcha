import type { ReCaptchaCompatibleVerificationResult, ReCaptchaCompatibleVerifyOptions } from "./recaptcha-compatible";
import { createReCaptchaCompatibleVerifier } from "./recaptcha-compatible";

const PROVIDER = "prosopo";

export type ProsopoErrorCode = string;
export type ProsopoVerificationResult = ReCaptchaCompatibleVerificationResult;
export type ProsopoVerifyOptions = ReCaptchaCompatibleVerifyOptions;

export const verifyProsopo = createReCaptchaCompatibleVerifier(PROVIDER);
