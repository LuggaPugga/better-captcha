import { postJson } from "../http";
import type { VerificationResult } from "../result";
import {
	asBoolean,
	assertNonEmptyString,
	type BaseVerifyOptions,
	buildProviderFormBody,
	finalizeProviderFailure,
	finalizeVerification,
	getOptionalString,
	getStringArray,
} from "../shared";

const PROVIDER = "recaptcha-compatible";

export type ReCaptchaCompatibleErrorCode = string;

export interface ReCaptchaCompatibleSuccessData {
	challengeTs?: string;
	hostname?: string;
}

export type ReCaptchaCompatibleVerificationResult = VerificationResult<
	ReCaptchaCompatibleSuccessData,
	ReCaptchaCompatibleErrorCode
>;

export interface ReCaptchaCompatibleVerifyOptions
	extends BaseVerifyOptions<ReCaptchaCompatibleSuccessData, ReCaptchaCompatibleErrorCode> {
	endpoint: string;
	secret: string;
	remoteip?: string;
	sitekey?: string;
	extraBody?: Record<string, string>;
}

export async function verifyWithReCaptchaCompatibleApi(
	provider: string,
	options: ReCaptchaCompatibleVerifyOptions,
): Promise<ReCaptchaCompatibleVerificationResult> {
	assertNonEmptyString(options.endpoint, "endpoint", provider);
	assertNonEmptyString(options.secret, "secret", provider);
	assertNonEmptyString(options.response, "response", provider);

	const body = buildProviderFormBody(options.secret, options.response, {
		...(options.extraBody ?? {}),
		remoteip: options.remoteip,
		sitekey: options.sitekey,
	});

	const raw = await postJson({
		url: options.endpoint,
		body,
		provider,
		fetcher: options.fetcher,
		signal: options.signal,
		timeoutMs: options.timeoutMs,
	});

	const success = asBoolean(raw.success, provider);
	const providerErrorCodes = getStringArray(raw["error-codes"]);

	if (!success) {
		return finalizeProviderFailure(options, raw, providerErrorCodes, "verification-failed");
	}

	return finalizeVerification(options, {
		success: true,
		data: {
			challengeTs: getOptionalString(raw.challenge_ts),
			hostname: getOptionalString(raw.hostname),
		},
		raw,
	});
}

export async function verifyReCaptchaCompatible(
	options: ReCaptchaCompatibleVerifyOptions,
): Promise<ReCaptchaCompatibleVerificationResult> {
	return verifyWithReCaptchaCompatibleApi(PROVIDER, options);
}
